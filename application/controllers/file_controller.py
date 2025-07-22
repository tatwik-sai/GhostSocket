import os
import subprocess
import json
import psutil
import zipfile
import io
import base64
import shutil

SIZE_IN_KB = 32
CHUNK_SIZE = SIZE_IN_KB * 1024

def get_full_paths(path: list, files: list) -> list:
    """    
    Given a path and a list of files, return the full paths for each file.

    Args:
        path (list): A list representing the path, e.g., ["C:", "Users", "Folder"].
        files (list): A list of file names to construct full paths for.
    Returns:
        list: A list of full paths constructed from the base path and file names.
    """
    base_path = os.path.join(*path[1:])
    full_paths = []
    for item in files:
        full_paths.append(os.path.join(base_path, item))
    return full_paths

def get_readable_size(size_in_bytes: int) -> str:
    """
    Convert size in bytes to a readable format.

    Args:
        size_in_bytes (int): Size in bytes to convert.
    Returns:
    str: Readable size as string.
    """
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if size_in_bytes < 1024:
            return f"{size_in_bytes:.0f} {unit}"
        size_in_bytes /= 1024
    return f"{size_in_bytes:.0f} PB"

def get_root_folders_structure():
    """
    Retrieve the structure of root folders on Windows(Partitions).

    Returns:
        list: A list of dictionaries representing root folders with their names, types, and sizes.
    """
    drives = psutil.disk_partitions(all=False)
    folders = []
    for drive in drives:
        if os.path.exists(drive.mountpoint):
            try:
                total_size = psutil.disk_usage(drive.mountpoint).used
                folders.append({
                    "*name": drive.device.strip("\\"),
                    "*type": "directory",
                    "*size": get_readable_size(total_size)
                })
            except PermissionError:
                continue
    return folders

def construct_windows_path(path_parts: list) -> str:
    """
    Construct a Windows path from a list of path parts.

    Args:
        path_parts (list): A list of path components, e.g., ["D:", "Downloads", "Folder"].
    Returns:
        str: A constructed Windows path.
    """
    if not path_parts:
        return ""
    
    if len(path_parts) == 1 and path_parts[0].endswith(':'):
        # Partition only
        return path_parts[0] + '\\'
    elif path_parts[0].endswith(':'):
        # Partition with subdirectories
        drive = path_parts[0] + '\\'
        subdirs = path_parts[1:]
        return os.path.join(drive, *subdirs)
    else:
        # Path joining
        return os.path.join(*path_parts)

def get_file_structure(path_array: list) -> list:
    """
    Retrieve the file structure for a given path on Windows.

    Args:
        path_array (list): A list representing the path, e.g., ["C:", "Users", "Folder"].
    """
    if path_array == ["root"]:
        return get_root_folders_structure()
    
    if path_array[0] == "root":
        actual_path = path_array[1:]
    else:
        actual_path = path_array

    full_path = construct_windows_path(actual_path)

    ps_command = f"""
    Get-ChildItem -Path '{full_path}' -Force |
    Where-Object {{
        -not $_.Attributes.ToString().Contains('Hidden') -and
        -not $_.Attributes.ToString().Contains('System')
    }} |
    Select-Object Name, FullName,
    @{{
        Name='IsFolder';
        Expression={{ $_.PSIsContainer }}
    }},
    @{{
        Name='Size';
        Expression={{
            try {{
                if ($_.PSIsContainer) {{
                    $s = (Get-ChildItem $_.FullName -Recurse -File -ErrorAction Stop | Measure-Object Length -Sum).Sum
                }} else {{
                    $s = $_.Length
                }}
                if ($s -lt 1KB) {{
                    "$s Bytes"
                }} elseif ($s -lt 1MB) {{
                    "{{0:N2}} KB" -f ($s / 1KB)
                }} elseif ($s -lt 1GB) {{
                    "{{0:N2}} MB" -f ($s / 1MB)
                }} else {{
                    "{{0:N2}} GB" -f ($s / 1GB)
                }}
            }} catch {{
                'Access Denied'
            }}
        }}
    }} |
    ConvertTo-Json
    """

    result = subprocess.run(['powershell', '-Command', ps_command], capture_output=True, text=True)

    if result.returncode != 0 or not result.stdout.strip(): 
        return []

    try:
        parsed = json.loads(result.stdout)
        if isinstance(parsed, dict):
            parsed = [parsed]

        output = []
        for item in parsed:
            name = item["Name"]
            is_folder = item["IsFolder"]
            size = item["Size"]
            if is_folder:
                type_ = "directory"
            else:
                ext = os.path.splitext(name)[1][1:].lower()
                type_ = ext if ext else "file"
            output.append({
                "*name": name,
                "*type": type_,
                "*size": size
            })
        return output
    except Exception as e:
        return [{"*error": "Failed to parse PowerShell output", "*details": str(e), "*raw": result.stdout.strip()}]

def zip_folder_and_files(paths: list) -> io.BytesIO:
    """
    Create a zip file from all the specified paths.
    Args:
        paths (list): A list of file or folder paths to include in the zip.
    Returns:
        io.BytesIO: A BytesIO object containing the zip file data.
    """
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zipf:
        for path in paths:
            if os.path.isfile(path):
                arcname = os.path.basename(path)
                zipf.write(path, arcname)
            elif os.path.isdir(path):
                for root, _, files in os.walk(path):
                    for file in files:
                        abs_path = os.path.join(root, file)
                        rel_path = os.path.relpath(abs_path, os.path.dirname(path))
                        zipf.write(abs_path, rel_path)
    zip_buffer.seek(0)
    return zip_buffer

def send_chunks(paths, data_channel):
    """
    Send the contents of the specified paths as chunks over the data channel.

    Args:
        paths (list): A list of file or folder paths to zip and send.
        data_channel: The channel to send the data over.
    Yields:
        dict: A dictionary containing the chunk metadata.
    """
    zip_data = zip_folder_and_files(paths).read()
    total_size = len(zip_data)

    data_channel.send(json.dumps({"type": "zip_start", "size": total_size}))
    print(f"[+] Sending zip of size {get_readable_size(total_size)}")

    for i in range(0, total_size, CHUNK_SIZE):
        chunk = zip_data[i:i + CHUNK_SIZE]
        chunk_b64 = base64.b64encode(chunk).decode('utf-8')
        yield json.dumps({
            "type": "zip_chunk",
            "offset": i,
            "data": chunk_b64
        })

    data_channel.send(json.dumps({"type": "zip_end"}))
    print("[+] ZIP transfer completed")

def delete_files(paths: list) -> None:
    """
    Delete the specified files or folders.
    Args:
        paths (list): A list of file or folder paths to delete.
    """
    for path in paths:
        try:
            if os.path.isfile(path) or os.path.islink(path):
                os.remove(path)
                print(f"[+] Deleted file: {path}")
            elif os.path.isdir(path):
                shutil.rmtree(path)
                print(f"[+] Deleted folder: {path}")
            else:
                print(f"[-] Path does not exist: {path}")
        except Exception as e:
            print(f"[-] Failed to delete {path}: {e}")


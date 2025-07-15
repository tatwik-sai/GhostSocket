import os
import subprocess as sp

def cmd(command):
    result = sp.Popen(command.split(), stderr=sp.PIPE, stdin=sp.DEVNULL, stdout=sp.PIPE, shell=True,
                        text=True, creationflags=0x08000000)
    out, err = result.communicate()
    result.wait()
    if not err:
        return {"success": True, "output": out}
    else:
        return {"success": False, "message": f"Error: {err.strip()}"}

def cd(path):
    try:
        if len(path) == 2 and path[1] == ':':
            path = path + '\\'
        
        os.chdir(path)
        return {"success": True, "path": os.getcwd()}
    except Exception as e:
        return {"success": False, "message": f"Error: {e}. Current directory: {os.getcwd()}"}
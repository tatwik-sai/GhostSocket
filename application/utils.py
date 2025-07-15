import os
import subprocess

def get_uuid():
    try:
        result = subprocess.check_output(
            ['powershell', '-Command', '(Get-CimInstance -Class Win32_ComputerSystemProduct).UUID'],
            stderr=subprocess.DEVNULL
        ).decode().strip()
        return result
    except Exception as e:
        return f"Error: {e}"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ASSETS_DIR = os.path.join(BASE_DIR, "assets")

def get_asset_path(filename):
    """Get the correct path for asset files"""
    return os.path.join(ASSETS_DIR, filename)
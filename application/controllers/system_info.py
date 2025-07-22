import os, ctypes
from urllib.request import Request, urlopen
import platform, requests

def isAdmin() -> bool:
    """Check if the current user has administrative privileges."""
    try:
        is_admin = (os.getuid() == 0)
    except AttributeError:
        is_admin = ctypes.windll.shell32.IsUserAnAdmin() != 0
    return is_admin

def getIP() -> str:
    """Fetch the public IP address of the system."""
    try:
        IP = urlopen(Request("https://ipv4.myip.wtf/text")).read().decode().strip()
    except Exception:
        IP = "None"
    return IP

def getBits() -> str:
    """Fetch the architecture bits of the system."""
    try:
        BITS = platform.architecture()[0]
    except Exception:
        BITS = "None"
    return BITS

def getUsername() -> str:
    """Fetch the username of the current user."""
    try:
        USERNAME = os.getlogin()
    except Exception:
        USERNAME = "None"
    return USERNAME

def getOS() -> str:
    """Fetch the operating system information of the system."""
    try:
        OS = platform.platform()
    except Exception:
        OS = "None"
    return OS

def getCPU() -> str:
    """Fetch the CPU information of the system."""
    try:
        CPU = platform.processor()
    except Exception:
        CPU = "None"
    return CPU

def getHostname() -> str:
    """Fetch the hostname of the system."""
    try:
        HOSTNAME = platform.node()
    except Exception:
        HOSTNAME = "None"
    return HOSTNAME

def location() -> dict:
    """Fetch the location of the system using an external API."""
    try:
        response = requests.get("https://json.ipv4.myip.wtf")
        response.raise_for_status()
        return response
    except Exception:
        return False

def get_system_info() -> dict:
    """return's system information including role, IP address, architecture, username, OS, CPU, hostname, and location."""
    return {
        "role": "Admin" if isAdmin() else "User",
        "ip": getIP(),
        "architecture": getBits(),
        "username": getUsername(),
        "os": getOS(),
        "cpu": getCPU(),
        "hostname": getHostname(),
        "location": location().json()["YourFuckingLocation"]
    }


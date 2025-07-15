import os, ctypes
from urllib.request import Request, urlopen
import platform, requests

def isAdmin():
    try:
        is_admin = (os.getuid() == 0)
    except AttributeError:
        is_admin = ctypes.windll.shell32.IsUserAnAdmin() != 0
    return is_admin

def getIP():
    try:
        IP = urlopen(Request("https://ipv4.myip.wtf/text")).read().decode().strip()
    except Exception:
        IP = "None"
    return IP

def getBits():
    try:
        BITS = platform.architecture()[0]
    except Exception:
        BITS = "None"
    return BITS

def getUsername():
    try:
        USERNAME = os.getlogin()
    except Exception:
        USERNAME = "None"
    return USERNAME

def getOS():
    try:
        OS = platform.platform()
    except Exception:
        OS = "None"
    return OS

def getCPU():
    try:
        CPU = platform.processor()
    except Exception:
        CPU = "None"
    return CPU

def getHostname():
    try:
        HOSTNAME = platform.node()
    except Exception:
        HOSTNAME = "None"
    return HOSTNAME

def location():
    try:
        response = requests.get("https://json.ipv4.myip.wtf")
        response.raise_for_status()
        return response
    except Exception:
        return False

def get_system_info():
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


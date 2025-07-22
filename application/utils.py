import os
import subprocess
import pystray
import requests
from PIL import Image
import sys
import asyncio
import threading

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ASSETS_DIR = os.path.join(BASE_DIR, "assets")

class AsyncLoopThread:
    """A thread that runs an asyncio event loop."""
    def __init__(self):
        self.loop = asyncio.new_event_loop()
        self.thread = threading.Thread(target=self._start_loop, daemon=True)
        self.thread.start()

    def _start_loop(self):
        asyncio.set_event_loop(self.loop)
        self.loop.run_forever()

    def run_coroutine(self, coro):
        return asyncio.run_coroutine_threadsafe(coro, self.loop)


def get_uuid():
    """Returns the UUID of the machine."""
    try:
        result = subprocess.check_output(
            ['powershell', '-Command', '(Get-CimInstance -Class Win32_ComputerSystemProduct).UUID'],
            stderr=subprocess.DEVNULL
        ).decode().strip()
        return result
    except Exception as e:
        return f"Error: {e}"

def get_asset_path(filename):
    if hasattr(sys, '_MEIPASS'):
        return os.path.join(sys._MEIPASS, "assets", filename)
    elif getattr(sys, 'frozen', False):
        return os.path.join(os.path.dirname(sys.executable), "assets", filename)
    else:
        return os.path.join("assets", filename)

def download_image_to_assets(url, path=None):
    """Download an image from a URL and save it to the assets directory."""
    if path is None:
        path = ASSETS_DIR

    filename = url.split("/")[-1]
    os.makedirs(path, exist_ok=True)
    filepath = os.path.join(path, filename)

    try:
        response = requests.get(url)
        response.raise_for_status()
        with open(filepath, "wb") as f:
            f.write(response.content)
        return filepath
    except Exception as e:
        print(f"[-] Failed to download image: {e}")
        return None

def create_tray(root):
    """
    Create a system tray icon with options to open the app or exit."""
    icon = Image.open("assets/icon.png")

    def on_open(icon, item):
        root.after(0, root.deiconify)

    def on_exit(icon, item):
        icon.stop()
        root.quit()
        sys.exit()

    menu = pystray.Menu(
        pystray.MenuItem("Open", on_open, default=True),
        pystray.MenuItem("Exit", on_exit)
    )

    icon = pystray.Icon("GhostSocket", icon, title="GhostSocket is on.", menu=menu)
    icon.run()
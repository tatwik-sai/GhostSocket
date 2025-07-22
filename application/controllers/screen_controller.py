from aiortc import VideoStreamTrack
from av import VideoFrame
import numpy as np
import cv2
from PIL import ImageGrab
import win32gui
import win32api
import win32ui
import win32con

class ScreenStreamTrack(VideoStreamTrack):
    """ A video stream track that captures the screen. """
    paused = False
    def __init__(self):
        super().__init__()
        self.is_screen_track = True

    async def recv(self) -> VideoFrame:
        """ Return's the next video frame. """
        if self.paused:
            pts, time_base = await self.next_timestamp()
            tiny_frame = np.zeros((1, 1, 3), np.uint8)
            frame = VideoFrame.from_ndarray(tiny_frame, format="bgr24")
            frame.pts = pts
            frame.time_base = time_base
            return frame
        
        pts, time_base = await self.next_timestamp()
        
        # img = self.capture_screen_with_cursor()
        img = self.capture_screen()
        
        frame = VideoFrame.from_ndarray(img, format="bgr24")
        frame.pts = pts
        frame.time_base = time_base
        return frame

    def capture_screen(self) -> np.ndarray:
        """Captures the entire screen."""
        try:
            screenshot = ImageGrab.grab()
            img = np.array(screenshot)
            img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
            return img
        except Exception as e:
            print(f"[-] Failed to capture screen: {e}")
            return None
    
    def capture_screen_with_cursor(self) -> np.ndarray:
        """Captures the entire screen including the cursor."""
        try:
            hdesktop = win32gui.GetDesktopWindow()
            width = win32api.GetSystemMetrics(win32con.SM_CXSCREEN)
            height = win32api.GetSystemMetrics(win32con.SM_CYSCREEN)
            
            desktop_dc = win32gui.GetWindowDC(hdesktop)
            img_dc = win32ui.CreateDCFromHandle(desktop_dc)
            mem_dc = img_dc.CreateCompatibleDC()
            
            screenshot = win32ui.CreateBitmap()
            screenshot.CreateCompatibleBitmap(img_dc, width, height)
            mem_dc.SelectObject(screenshot)
            
            mem_dc.BitBlt((0, 0), (width, height), img_dc, (0, 0), win32con.SRCCOPY)
            
            try:
                cursor_info = win32gui.GetCursorInfo()
                if cursor_info[1]:
                    cursor_x, cursor_y = cursor_info[2]
                    cursor_handle = cursor_info[1]
                    
                    win32gui.DrawIcon(mem_dc.GetSafeHdc(), cursor_x, cursor_y, cursor_handle)
            except Exception as cursor_error:
                print(f"[-] Could not draw cursor: {cursor_error}")
            
            bmpstr = screenshot.GetBitmapBits(True)
            img = np.frombuffer(bmpstr, dtype='uint8')
            img.shape = (height, width, 4)
            img = img[:, :, :3]
            
            mem_dc.DeleteDC()
            win32gui.ReleaseDC(hdesktop, desktop_dc)
            return img
            
        except Exception as e:
            print(f"[-] Failed to capture with cursor: {e}")
            screenshot = ImageGrab.grab()
            img = np.array(screenshot)
            img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
            return img
    
    @classmethod
    def pause(cls):
        cls.paused = True
        print("[#] Screen track paused")
    
    @classmethod
    def resume(cls):
        cls.paused = False
        print("[#] Screen track resumed")

    def stop(self):
        super().stop()

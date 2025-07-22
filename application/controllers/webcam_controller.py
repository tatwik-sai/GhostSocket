import cv2
import numpy as np
from av import VideoFrame
from aiortc import VideoStreamTrack

class WebcamStreamTrack(VideoStreamTrack):
    """A video stream track that captures frames from a webcam."""
    paused = False
    def __init__(self):
        super().__init__()
        self.cap = cv2.VideoCapture(0)

    async def recv(self) -> VideoFrame:
        """Returns a video frame from the webcam."""
        if self.paused:
            pts, time_base = await self.next_timestamp()
            tiny_frame = np.zeros((1, 1, 3), np.uint8)
            frame = VideoFrame.from_ndarray(tiny_frame, format="bgr24")
            frame.pts = pts
            frame.time_base = time_base
            return frame
        pts, time_base = await self.next_timestamp()
        ret, frame = self.cap.read()
        if not ret:
            frame = np.zeros((480, 640, 3), np.uint8)
        video_frame = VideoFrame.from_ndarray(frame, format="bgr24")
        video_frame.pts = pts
        video_frame.time_base = time_base
        return video_frame
    
    @classmethod
    def pause(cls):
        cls.paused = True
        print("[#] WebCam track paused")

    @classmethod
    def resume(cls):
        cls.paused = False
        print("[#] WebCam track resumed")

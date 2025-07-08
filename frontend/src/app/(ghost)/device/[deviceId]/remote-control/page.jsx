"use client"
import { useSocket } from "@/context/SocketContext";
import { useStreamsAndConnectionStore } from "@/store/slices/ActiveConnection/StreamsAndConnectionSlice";
import { useParams} from "next/navigation";
import { useEffect, useRef } from "react";

const RemoteControlPage = () => {
    const { deviceId } = useParams();
    const screenVideo = useRef(null);
    const {socket, isConnected: isSocketConnected} = useSocket();
    const {screenStream, peerConnection} = useStreamsAndConnectionStore();

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
            if (peerConnection && peerConnection.connectionState === "connected" && screenStream) {
                socket.current.emit("to-device", {message: "pause_screen"});
            }
        });

        screenVideo.current.addEventListener("play", () => {
            if (peerConnection && peerConnection.connectionState === "connected" && screenStream) {
                socket.current.emit("to-device", {message: "resume_screen"});
            }  
        });
    }, [deviceId, screenStream, peerConnection]);

  return (
    <div className="flex flex-col h-[100vh] p-3 pb-0 pr-0">
        <div className="text-white/80 text-3xl font-bold mb-2">
            Remote Controller
        </div>
        <div className="h-[1px] w-full bg-dark-4"></div>

        <div className="py-2 w-[50%]">
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

export default RemoteControlPage

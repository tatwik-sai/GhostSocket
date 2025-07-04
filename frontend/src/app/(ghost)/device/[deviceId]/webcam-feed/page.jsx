"use client"
import { useSocket } from "@/context/SocketContext";
import { useActiveConnectionStore } from "@/store/slices/ActiveConnectionSlice";
import { useParams} from "next/navigation";
import { useEffect, useRef } from "react";

const WebCamPage = () => {
    const { deviceId } = useParams();
    const webcamVideo = useRef(null);
    const {socket, isConnected: isSocketConnected} = useSocket();
    const {webcamStream, peerConnection} = useActiveConnectionStore();

    useEffect(() => {
        if (!socket?.current || !isSocketConnected) return;
        if (webcamStream) {
            console.log("Setting screen video source", webcamStream);
            webcamVideo.current.srcObject = webcamStream;
            socket.current.emit("to-device", {message: "pause_screen"});
        } else {
            webcamVideo.current.srcObject = null;
        }

        socket.current.on("from-device", (data) => {
            
        });

        webcamVideo.current.addEventListener("pause", () => {
            if (peerConnection?.connectionState === "connected" && webcamStream) {
                socket.current.emit("to-device", {message: "pause_webcam"});
            }
        });

        webcamVideo.current.addEventListener("play", () => {
            if (peerConnection?.connectionState === "connected" && webcamStream) {
                socket.current.emit("to-device", {message: "resume_webcam"});
            }  
        });
    }, [deviceId, webcamStream, peerConnection]);

  return (
    <div>
        <div style={{ width: '50%' }}>
            <h3>Webcam Feed</h3>
            <video 
                ref={webcamVideo} 
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

export default WebCamPage   

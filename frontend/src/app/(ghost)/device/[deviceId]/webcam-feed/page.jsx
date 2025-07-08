"use client"
import { useSocket } from "@/context/SocketContext";
import { useStreamsAndConnectionStore } from "@/store/slices/ActiveConnection/StreamsAndConnectionSlice";
import { useParams} from "next/navigation";
import { useEffect, useRef } from "react";

const WebCamPage = () => {
    const { deviceId } = useParams();
    const webcamVideo = useRef(null);
    const {socket, isConnected: isSocketConnected} = useSocket();
    const {webcamStream, peerConnection} = useStreamsAndConnectionStore();

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
    <div className="flex flex-col h-[100vh] p-3 pb-0 pr-0">
        <div className="text-white/80 text-3xl font-bold mb-2">
            Webcam Feed
        </div>
        <div className="h-[1px] w-full bg-dark-4"></div>

        <div className="py-2 w-[50%]">
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

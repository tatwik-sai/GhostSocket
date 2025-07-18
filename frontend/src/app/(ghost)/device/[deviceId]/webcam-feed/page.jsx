"use client"
import { Button } from "@/components/ui/button";
import { useSocket } from "@/context/SocketContext";
import { apiClient } from "@/lib/apiClient";
import { useDeviceProfileStore } from "@/store/slices/ActiveConnection/DeviceProfileSlice";
import { useStreamsAndConnectionStore } from "@/store/slices/ActiveConnection/StreamsAndConnectionSlice";
import { useWebCamStore } from "@/store/slices/ActiveConnection/WebCamStore";
import { HOST } from "@/utils/constants";
import { useAuth } from "@clerk/nextjs";
import { useParams, useRouter} from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FaCamera } from "react-icons/fa";
import { FiDownload } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import { toast } from "sonner";

const WebCamPage = () => {
    const { deviceId } = useParams();
    const webcamVideo = useRef(null);
    const canvasRef = useRef(null);
    const { getToken } = useAuth();
    const [selectedImage, setSelectedImage] = useState(null);
    const {socket, isConnected: isSocketConnected} = useSocket();
    const {webcamStream, peerConnection} = useStreamsAndConnectionStore();
    const {images, addImage, setImages} = useWebCamStore()

    const router = useRouter()
    const {permissions} = useDeviceProfileStore();
    useEffect(() => {
        const {permissions} = useDeviceProfileStore.getState();
        if (permissions !== null && !permissions[4].value.allowed) {
            router.push(`/device/${deviceId}/device-profile`);
            toast.error("You don't have access to Webcam.");
        }
    }, [permissions])

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const clerk_token = await getToken();
                const response = await apiClient.get(`devices/${deviceId}/get-uploads?type=webcam`, {
                    headers: { Authorization: `Bearer ${clerk_token}` }
                });
                setImages(response.data);
                console.log("Fetched images:", response.data);
            } catch (err) {
                console.error("Failed to fetch images:", err);
            }
        };
        if (images.length > 0) return;
        fetchImages();

        return () => {
        };
    }, []);

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

    const downloadImage = async () => {
        const response = await fetch(selectedImage, { mode: 'cors' });
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `screenshot-${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        };
    
    const takeAndUploadSnapshot = () => {
        const video = webcamVideo.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(async (blob) => {
        if (!blob) {
            toast.error("Failed to capture snapshot", {
                variant: "destructive"
            });
            return;
        };
        const formData = new FormData();
        formData.append("snapshot", blob, `snapshot-${Date.now()}.png`);
        formData.append("deviceId", deviceId);
        formData.append("type", "webcam");

        try {
            const clerk_token = await getToken();
            const response = await apiClient.post(`/devices/${deviceId}/uploads`, formData, {
            headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${clerk_token}`}
            });
            addImage(response.data.id);
        } catch (err) {
            console.error("Upload failed:", err);
        }
        }, "image/png");
    };

  return (
    <div className="flex flex-col h-screen p-3 pb-0 pr-0">
    <div className="text-white text-3xl font-bold mb-2">WebCam Feed</div>

    <div className="flex flex-1 w-full overflow-hidden gap-2">
        <div className="flex flex-col flex-[3] gap-4 h-full">
        <div className="w-full px-0 py-4">
            <div className="max-w-[960px] aspect-video rounded-xl overflow-hidden border border-neutral-700 shadow-xl">
            <video
                ref={webcamVideo}
                autoPlay
                playsInline
                controls
                muted
                className="w-full h-full object-contain bg-black"
            />
            </div>
        </div>
        <div className="flex gap-2 px-1 pb-4">
            <Button className="bg-purple-1 hover:scale-105 active:scale-100 transition-all duration-300 font-bold" onClick={takeAndUploadSnapshot}>
                <FaCamera />
                SnapShot
            </Button>
        </div>
        </div>

        <div className="flex flex-col flex-[2] h-full bg-dar rounded-xl">
        <h3 className="text-white text-xl font-semibold p-4 pt-3 border-b border-white/20">
            Snapshots
        </h3>
        <div className="flex-1 custom-scrollbar overflow-y-auto p-6">
            <div className="grid grid-cols-2 gap-5">
                {images.map((image) => (
                    <img
                    key={image}
                    src={`${HOST}/uploads/${image}`}
                    alt="screenshot"
                    className="shadow-xl border-[3px] border-[#ffffff1a] rounded-xl hover:scale-110 transition-all duration-300"
                    onClick={() => setSelectedImage(`${HOST}/uploads/${image}`)}
                    />
                ))}
            </div>
            {images.length === 0 && (
            <div className="text-gray-400 text-left">
                No snapshots available.
            </div>
            )}
        </div>
        </div>
    </div>

    <canvas ref={canvasRef} className="hidden" />

    {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Background overlay with 90% opacity */}
        <div className="absolute inset-0 bg-black opacity-90"></div>

        {/* Foreground content */}
        <div className="relative z-10 w-full h-full flex justify-center items-center p-4">
            <div className="flex flex-col gap-5 items-center justify-center">
            <div className="flex gap-5">
                <div className="bg-dark-4 rounded-full p-2 hover:bg-dark-5 hover:scale-105 active:95 transition-all duration-300">
                <FiDownload className="text-3xl" onClick={downloadImage} />
                </div>
                <div className="bg-dark-4 rounded-full p-2 hover:bg-dark-5 hover:scale-105 active:95 transition-all duration-300">
                <IoMdClose className="text-3xl" onClick={() => setSelectedImage(null)} />
                </div>
            </div>
            <img
                src={selectedImage}
                alt="Full View"
                className="max-w-[90vw] max-h-[80vh] rounded-lg shadow-2xl"
            />
            </div>
        </div>
        </div>
    )}
    </div>

  )
}

export default WebCamPage   

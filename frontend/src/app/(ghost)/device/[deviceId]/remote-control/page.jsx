"use client"
import { Button } from "@/components/ui/button";
import { useSocket } from "@/context/SocketContext";
import { apiClient } from "@/lib/apiClient";
import { useRemoteControlStore } from "@/store/slices/ActiveConnection/RemoteControlSlice";
import { useStreamsAndConnectionStore } from "@/store/slices/ActiveConnection/StreamsAndConnectionSlice";
import { HOST } from "@/utils/constants";
import { useAuth } from "@clerk/nextjs";
import { FiDownload } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import { FaCamera } from "react-icons/fa";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useKeyboardTracker, useMouseTracker } from "./controller";
import { toast } from "sonner";
import { useDeviceProfileStore } from "@/store/slices/ActiveConnection/DeviceProfileSlice";

const RemoteControlPage = () => {

    const { deviceId } = useParams();
    const screenVideo = useRef(null);
    const canvasRef = useRef(null);
    const [controlling, setControlling] = useState(false);
    const { getToken } = useAuth();
    const [selectedImage, setSelectedImage] = useState(null);
    const { socket, isConnected: isSocketConnected } = useSocket();
    const { screenStream, peerConnection } = useStreamsAndConnectionStore();
    const { images, addImage, setImages, setScreenDimensions, setScaledScreenDimensions } = useRemoteControlStore()
    const { start: startKeyboard, stop: stopKeyboard } = useKeyboardTracker();
    const { start: startMouse, stop: stopMouse } = useMouseTracker(screenVideo);

    const router = useRouter()
    const { permissions } = useDeviceProfileStore();
    useEffect(() => {
        const { permissions } = useDeviceProfileStore.getState();
        if (permissions !== null && !permissions[0].value.allowed && !permissions[1].value.allowed) {
            router.push(`/device/${deviceId}/device-profile`);
            toast.error("You don't have permission for ScreenView or Control.");
        }
    }, [permissions])

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const clerk_token = await getToken();
                const response = await apiClient.get(`/devices/${deviceId}/get-uploads?type=screen`, {
                    headers: { Authorization: `Bearer ${clerk_token}` }
                });
                setImages(response.data);
            } catch (err) {
                console.error("Failed to fetch images:", err);
            }
        };
        if (images.length > 0) return;
        fetchImages();
    }, []);

    useEffect(() => {
        const handleFullscreenChange = () => {
            const fullscreenElement = document.fullscreenElement;
            if (fullscreenElement === null) {
                if (controlling) {
                    setControlling(false);
                    stopKeyboard();
                    stopMouse();
                }
            } else if (fullscreenElement === screenVideo.current) {
            }
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);

        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
        };
    }, [controlling]);

    useEffect(() => {
        if (!socket?.current || !isSocketConnected) return;
        if (screenStream) {
            screenVideo.current.srcObject = screenStream;
            screenVideo.current.onloadedmetadata = () => {
                const videoWidth = screenVideo.current.videoWidth;
                const videoHeight = screenVideo.current.videoHeight;
                console.log(`Actual video resolution: ${videoWidth}x${videoHeight}`);
                
                setScreenDimensions(videoWidth, videoHeight);
            };
            socket.current.emit("to-device", { message: "pause_webcam" });
        } else {
            screenVideo.current.srcObject = null;
        }

        socket.current.on("from-device", (data) => {

        });

        screenVideo.current.addEventListener("pause", () => {
            if (peerConnection && peerConnection.connectionState === "connected" && screenStream) {
                socket.current.emit("to-device", { message: "pause_screen" });
            }
        });

        screenVideo.current.addEventListener("play", () => {
            if (peerConnection && peerConnection.connectionState === "connected" && screenStream) {
                socket.current.emit("to-device", { message: "resume_screen" });
            }
        });
    }, [deviceId, screenStream, peerConnection]);

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
        const video = screenVideo.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            toast.error("Video Stream not available", {
                variant: "destructive"
            }
            );
            return
        };

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
            formData.append("type", "screen");

            try {
                const clerk_token = await getToken();
                const response = await apiClient.post(`/devices/${deviceId}/uploads`, formData, {
                    headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${clerk_token}` }
                });
                addImage(response.data.id);
            } catch (err) {
                console.error("Upload failed:", err);
            }
        }, "image/png");
    };

    const handleControl = () => {
        const { tcpDataChannel } = useStreamsAndConnectionStore.getState();

        if (!tcpDataChannel || !tcpDataChannel.readyState === "open") {
            toast.error("Video stream is not open.", {
                variant: "destructive"
            });
            return;
        }
        if (controlling) {
            setControlling(false);
        } else {
            setControlling(true);
            screenVideo.current.requestFullscreen().then(() => {
                const rect = screenVideo.current.getBoundingClientRect();
                const displayWidth = rect.width;
                const displayHeight = rect.height;
                console.log("Fullscreen dimensions:", displayWidth, displayHeight, "left:", rect.left, "top:", rect.top);
                setScaledScreenDimensions(displayWidth, displayHeight, rect.left, rect.top);
                startKeyboard();
                startMouse();
            }).catch((err) => {
                console.error("Fullscreen failed:", err);
                startKeyboard();
                startMouse();
            });
        }
    }

    return (
        <div className="flex flex-col h-screen p-2 sm:p-3 pb-0 pr-0">
            <div className="text-white text-3xl font-bold mb-2">Remote Control</div>
            <div className="flex flex-col lg:flex-row flex-1 min-h-0 w-full overflow-hidden gap-2">
                <div className="flex flex-col lg:flex-[3] gap-4 ">
                    <div className="w-full pr-1">
                        <div className="max-w-[960px] aspect-video rounded-sm overflow-hidden border border-neutral-700 shadow-xl">
                            <video
                                ref={screenVideo}
                                autoPlay
                                playsInline
                                controls
                                muted
                                className="w-full h-full object-contain bg-black"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3 px-1 ">
                        <Button className="bg-purple-1 hover:scale-105 active:scale-100 transition-all duration-300 font-bold" onClick={takeAndUploadSnapshot}>
                            <FaCamera />
                            SnapShot
                        </Button>
                        {permissions && permissions[0].value.allowed &&
                            <Button className={`${controlling ? "bg-primary-red hover:bg-primary-red-hover" : "bg-dark-4 hover:bg-dark-5"} 
                    hover:scale-105 active:scale-100 transition-all duration-300 font-bold`} onClick={handleControl}>
                                {controlling ? "Stop Controll" : "Start Controll"}
                            </Button>}
                    </div>
                </div>

                {/* ScreenShots */}
                <div className="flex fex-1 min-h-0 flex-col lg:flex-[2] h-full  rounded-xl">
                    <h3 className="text-white text-xl font-semibold pb-2 border-b border-white/20">
                        Snapshots
                    </h3>
                    <div className="custom-scrollbar flex-1 min-h-0 overflow-y-auto p-3 lg:p-4">
                        <div className="grid grid-cols-2 gap-2 lg:gap-4">
                            {images.map((image) => (
                                <img
                                    key={image}
                                    src={`${HOST}/uploads/${image}`}
                                    alt="screenshot"
                                    className="shadow-xl border-[3px] border-[#ffffff1a] rounded-md hover:scale-105 xl:hover:scale-110 transition-all duration-300 max-w-full max-h-[30vh] object-contain"
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
                    {/* Background overlay */}
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

export default RemoteControlPage

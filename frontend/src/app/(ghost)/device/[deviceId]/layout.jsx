"use client"
import React, { useEffect, useRef, useState } from 'react'
import { navItems } from './nav_items';
import { useParams, usePathname } from "next/navigation";
import Link from 'next/link';
import { useSocket } from '@/context/SocketContext';
import { Button } from '@/components/ui/button';
import { toast } from "sonner"
import { useActiveConnectionStore } from '@/store/slices/ActiveConnectionSlice';

const ControlPanelLayout = ({children}) => {
    const { deviceId } = useParams();
    const pathname = usePathname();
    const {socket, isConnected: isSocketConnected} = useSocket();
    const connectBtn = useRef(null);
    const [connectButtonState, setConnectButtonState] = useState({text: "Connect", inProcess: false})

    const {peerConnection, screenStream, webcamStream, setScreenStream, setWebcamStream, setPeerConnection} = useActiveConnectionStore()

    const initializeWebRTC = () => {
        console.log("🔧 Initializing WebRTC connection");
        
        // Close existing connection if it exists
        if (peerConnection) {
            peerConnection.close();
        }
        
        // Create new RTCPeerConnection
        const newPeerConnection = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' }
            ]
        });
        
        // Set it in the store
        setPeerConnection(newPeerConnection);
                
        // Set up track handler on the new connection (not the state variable)
        newPeerConnection.ontrack = (event) => {
            if (event.track.kind === "video") {
                const stream = new MediaStream([event.track]);
                const currentState = useActiveConnectionStore.getState();
                if (!currentState.screenStream) {
                    console.log("Setting screen video");
                    setScreenStream(stream);
                } else if (!currentState.webcamStream) {
                    console.log("Setting webcam video");
                    setWebcamStream(stream);
                }
            }
        };

        // Set up connection state handler
        newPeerConnection.onconnectionstatechange = () => {
            console.log("🔗 Connection State:", newPeerConnection.connectionState);
            if (newPeerConnection.connectionState === "connected") {
                console.log("WebRTC fully connected");
                setConnectButtonState({inProcess: false, text: "Disconnect"});
            } else if (newPeerConnection.connectionState === "disconnected" || newPeerConnection.connectionState === "failed") {
                console.log("WebRTC disconnected or failed");
                setConnectButtonState({inProcess: false, text: "Connect"});
                // Clear video sources
                setScreenStream(null);
                setWebcamStream(null);
            }
        };

        // Set up ICE connection state handler
        newPeerConnection.oniceconnectionstatechange = () => {
            console.log("🧊 ICE Connection State:", newPeerConnection.iceConnectionState);
        };
        
        // Return the new connection for immediate use
        return newPeerConnection;
    };

    useEffect(() => {
        if (!socket?.current || !isSocketConnected) return;

        console.log("🚀 Setting up socket listeners");

        const handleWebRTCOffer = async (data) => {
            console.log("📩 Received WebRTC offer from device", data);
            try {
                let currentPeerConnection = peerConnection;
                
                // Make sure we have a fresh WebRTC connection
                // if (!currentPeerConnection || currentPeerConnection.connectionState === "closed") {
                //     currentPeerConnection = initializeWebRTC();
                // }

                currentPeerConnection = initializeWebRTC();
                await currentPeerConnection.setRemoteDescription(data.offer);
                const answer = await currentPeerConnection.createAnswer();
                await currentPeerConnection.setLocalDescription(answer);
                
                socket.current.emit("webrtc-answer", {
                    deviceId,
                    answer: currentPeerConnection.localDescription,
                });
                console.log("📤 Sent WebRTC answer to device", data.deviceId);
            } catch (error) {
                console.error("❌ Error handling WebRTC offer:", error);
                // Reset connection on error
                initializeWebRTC();
            }
        };

        const handleICECandidate = async (data) => {
            console.log("🌍 Received ICE candidate from device", data);
            try {
                if (peerConnection && data.ice) {
                    await peerConnection.addIceCandidate(new RTCIceCandidate(data.ice));
                    console.log("✅ Added ICE candidate successfully");
                }
            } catch (error) {
                console.error("❌ Failed to add ICE candidate:", error);
            }
        };

        const handleStopWebRTC = (deviceIssue=false) => {
            console.log("🔌 Stopping WebRTC connection");
            setScreenStream(null);
            setWebcamStream(null);
            if (peerConnection) {
                peerConnection.close();
                setPeerConnection(null);
            }
            if (deviceIssue) {
                toast.error("Device disconnected or unavailable");
            }
            setConnectButtonState({inProcess: false, text: "Connect"});
        };

        socket.current.on("webrtc-offer", handleWebRTCOffer);
        socket.current.on("webrtc-ice-candidate", handleICECandidate);
        socket.current.on("stopped-webrtc", handleStopWebRTC);
        socket.current.on("stop-webrtc", () => handleStopWebRTC(true));
        socket.current.on("error", (data) => {
          toast.error(data.message || "An error occurred");
          setConnectButtonState({inProcess: false, text: (peerConnection?.connectionState === "connected") ? "Disconnect"  : "Connect"});
        });

        // initializeWebRTC();

        return () => {
            if (socket.current) {
                socket.current.off("webrtc-offer", handleWebRTCOffer);
                socket.current.off("webrtc-ice-candidate", handleICECandidate);
            }
            if (peerConnection) {
                peerConnection.close();
            }
        };

    }, [socket, isSocketConnected, deviceId]);

    const handleConnect = () => {
        if (!socket?.current || !isSocketConnected) {
            console.error("Socket not connected");
            return;
        }

        if (peerConnection?.connectionState === "connected") {
            console.log("🔌 Disconnecting from stream");
            socket.current.emit("stop-webrtc");
            setConnectButtonState({inProcess: true, text: "Disconnecting..."});
            
            setScreenStream(null);
            setWebcamStream(null);
            
            if (peerConnection) {
                peerConnection.close();
                setPeerConnection(null);
            }
            
        } else {
            console.log("🚀 Requesting stream start for device:", deviceId);
            
            // Initialize and get the new connection
            const newConnection = initializeWebRTC();
            
            socket.current.emit("initiate-webrtc", {
                deviceId,
            });
            setConnectButtonState({inProcess: true, text: "Connecting..."});
        }
    };

  return (  
    <>
        <div className='flex'>
            <div className="flex w-60 p-2">
                <Button 
                    ref={connectBtn} 
                    onClick={handleConnect} 
                    className="bg-dark-5 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-50" 
                    disabled={!isSocketConnected || connectButtonState.inProcess}
                >
                    {connectButtonState.text}
                </Button>

                <ul className="flex flex-col gap-3 mr-2 ml-2 flex-1">
                  {navItems.map((item) => {
                    const path = `/device/${deviceId}/${item.href}`
                    return (
                    <li key={item.name}>
                      <Link
                        href={path}
                        className={`flex gap-3 items-center rounded-lg p-3 transition-colors ${
                          pathname === path
                            ? "bg-primary-red"
                            : "hover:bg-white/10"
                        }`}
                      >
                        <item.icon size={22} className={`${pathname === path ? "invert brightness-0" : ""}`}/>
                        <span className="text-white text-sm font-medium">{item.name}</span>
                      </Link>
                    </li>
                  )})}
                </ul>
            </div>

            <div className='w-1 bg-dark-5 h-[100vh]'></div>

            <div className='flex-1 p-5'>
                {children}
            </div>
        </div>
    </>
  )
}

export default ControlPanelLayout

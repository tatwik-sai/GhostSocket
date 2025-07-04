"use client"
import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation';
import { useSocket } from '@/context/SocketContext';
import react from 'react';
import { Button } from '@/components/ui/button';
import { connect } from 'socket.io-client';
import { toast } from "sonner"

const Device = () => {
    const {deviceId} = useParams();
    const {socket, isConnected} = useSocket();
    const pcRef = useRef(null);
    const screenVideo = useRef(null);
    const webcamVideo = useRef(null);
    const connectBtn = useRef(null);
    const [connectButtonState, setConnectButtonState] = useState({text: "Connect", inProcess: false})

    const initializeWebRTC = () => {
        console.log("🔧 Initializing WebRTC connection");
        
        // Close existing connection if it exists
        if (pcRef.current) {
            pcRef.current.close();
        }
        
        // Create new RTCPeerConnection
        pcRef.current = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' }
            ]
        });

        // Set up track handler
        pcRef.current.ontrack = (event) => {
            console.log("📺 Received track from device", event);
            if (event.track.kind === "video") {
                const stream = new MediaStream([event.track]);
                
                if (!screenVideo.current?.srcObject) {
                    console.log("Setting screen video");
                    screenVideo.current.srcObject = stream;
                    screenVideo.current.play().catch(e => console.log("Screen play error:", e));
                } else if (!webcamVideo.current?.srcObject) {
                    console.log("Setting webcam video");
                    webcamVideo.current.srcObject = stream;
                    webcamVideo.current.play().catch(e => console.log("Webcam play error:", e));
                }
            }
        };

        // Set up connection state handler
        pcRef.current.onconnectionstatechange = () => {
            console.log("🔗 Connection State:", pcRef.current.connectionState);
            if (pcRef.current.connectionState === "connected") {
                console.log("WebRTC fully connected");
                setConnectButtonState({inProcess: false, text: "Disconnect"});
            } else if (pcRef.current.connectionState === "disconnected" || pcRef.current.connectionState === "failed") {
                console.log("WebRTC disconnected or failed");
                setConnectButtonState({inProcess: false, text: "Connect"});
                // Clear video sources
                if (screenVideo.current) screenVideo.current.srcObject = null;
                if (webcamVideo.current) webcamVideo.current.srcObject = null;
            }
        };

        // Set up ICE connection state handler
        pcRef.current.oniceconnectionstatechange = () => {
            console.log("🧊 ICE Connection State:", pcRef.current.iceConnectionState);
        };
    };

    useEffect(() => {
        if (!socket?.current || !isConnected) return;

        console.log("🚀 Setting up socket listeners");

        const handleWebRTCOffer = async (data) => {
            console.log("📩 Received WebRTC offer from device", data);
            try {
                // Make sure we have a fresh WebRTC connection
                if (!pcRef.current || pcRef.current.connectionState === "closed") {
                    initializeWebRTC();
                }
                
                await pcRef.current.setRemoteDescription(data.offer);
                const answer = await pcRef.current.createAnswer();
                await pcRef.current.setLocalDescription(answer);
                
                socket.current.emit("webrtc-answer", {
                    deviceId,
                    answer: pcRef.current.localDescription,
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
                if (pcRef.current && data.ice) {
                    await pcRef.current.addIceCandidate(new RTCIceCandidate(data.ice));
                    console.log("✅ Added ICE candidate successfully");
                }
            } catch (error) {
                console.error("❌ Failed to add ICE candidate:", error);
            }
        };


        socket.current.on("webrtc-offer", handleWebRTCOffer);
        socket.current.on("webrtc-ice-candidate", handleICECandidate);
        socket.current.on("error", (data) => {
          toast.error(data.message || "An error occurred");
          setConnectButtonState({inProcess: false, text: (pcRef.current?.connectionState === "connected") ? "Disconnect"  : "Connect"});
        });

        initializeWebRTC();

        return () => {
            if (socket.current) {
                socket.current.off("webrtc-offer", handleWebRTCOffer);
                socket.current.off("webrtc-ice-candidate", handleICECandidate);
            }
            if (pcRef.current) {
                pcRef.current.close();
            }
        };

    }, [socket, isConnected, deviceId]);

    const handleConnect = () => {
        if (!socket?.current || !isConnected) {
            console.error("Socket not connected");
            return;
        }

        if (connectButtonState.text === "Disconnect") {
            console.log("🔌 Disconnecting from stream");
            socket.current.emit("stop-webrtc");
            setConnectButtonState({inProcess: true, text: "Disconnecting..."});
            
            if (screenVideo.current) screenVideo.current.srcObject = null;
            if (webcamVideo.current) webcamVideo.current.srcObject = null;
            
            if (pcRef.current) {
                pcRef.current.close();
                pcRef.current = null;
            }
            
            setTimeout(() => {
                setConnectButtonState({inProcess: false, text: "Connect"});
            }, 1000);
            
        } else {
            console.log("🚀 Requesting stream start for device:", deviceId);
            
            initializeWebRTC();
            
            socket.current.emit("initiate-webrtc", {
                deviceId,
            });
            setConnectButtonState({inProcess: true, text: "Connecting..."});
        }
    };



    return (
      <div>
        <div className="mb-4">
            <span>Device ID: {deviceId}</span>
            <span className={`ml-4 ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
                {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </span>
        </div>
        
        <h1>Remote Screen Viewer</h1>
        
        <div style={{ display: 'flex', gap: '20px' }}>
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
            <div style={{ width: '50%' }}>
                <h3>Webcam</h3>
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

        <br />
        <Button 
            ref={connectBtn} 
            onClick={handleConnect} 
            className="bg-dark-5 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-50" 
            disabled={!isConnected || connectButtonState.inProcess}
        >
            {connectButtonState.text}
        </Button>
      </div>
    );
};

export default Device;
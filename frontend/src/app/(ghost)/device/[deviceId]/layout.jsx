"use client"
import React, { useEffect, useRef, useState, useMemo} from 'react'
import debounce from 'lodash/debounce';
import { navItems } from './nav_items';
import { useParams, usePathname } from "next/navigation";
import Link from 'next/link';
import { useSocket } from '@/context/SocketContext';
import { Button } from '@/components/ui/button';
import { toast } from "sonner"
import { useFileStore } from '@/store/slices/ActiveConnection/FileSlice';
import { useStreamsAndConnectionStore } from '@/store/slices/ActiveConnection/StreamsAndConnectionSlice';
import { useTerminalStore } from '@/store/slices/ActiveConnection/TerminalSlice';
import { getReadableSize } from '@/utils/utilities';
import { useResourcesStore } from '@/store/slices/ActiveConnection/ResourcesSlice';
import { FaWindows } from 'react-icons/fa';
import { useAuth } from '@clerk/clerk-react';
import { useDeviceProfileStore } from '@/store/slices/ActiveConnection/DeviceProfileSlice';
import { apiClient } from '@/lib/apiClient';
import { useWebCamStore } from '@/store/slices/ActiveConnection/WebCamStore';
import { useRemoteControlStore } from '@/store/slices/ActiveConnection/RemoteControlSlice';
import { permissionDesriptions } from '@/utils/constants';
import Image from 'next/image';


const ControlPanelLayout = ({children}) => {
    const statusColors = {
    online: "bg-purple-1",
    offline: "bg-gray-500",
    };
    const { deviceId } = useParams();
    const pathname = usePathname();
    const {socket, isConnected: isSocketConnected} = useSocket();
    const connectBtn = useRef(null);
    const {getToken} = useAuth();
    const [connectButtonState, setConnectButtonState, ] = useState({text: "Connect", inProcess: false})

    const {deviceInfo, permissions, setDeviceInfo, setPermissions, resetDeviceProfile} = useDeviceProfileStore();

    const {setIsRefreshing, addFilesToPath, setDownloadProgress, 
        setNumDownloadingFiles, setDownloadFileSize, setDownloadedFileSize,
        setIsDownloading, updateFilesToPath, setSelectedFiles, resetFileStore} = useFileStore();

    const {peerConnection, setAudioStream , setScreenStream, setWebcamStream, 
        setPeerConnection, setTcpDataChannel, setUdpDataChannel, resetStreamsAndConnection} = useStreamsAndConnectionStore()
    
    const {setIsExecuting, setCurrentPath, addToTerminalExecutions, getPrompt, setSystemUserName, resetTerminal} = useTerminalStore();

    const {setStaticCPUInfo, setDynamicCPUInfo, setStaticMemoryInfo, setDynamicMemoryInfo,
         addToCPUChartData, addToMemoryChartData ,setProcessesList, resetResources} = useResourcesStore();
    
    const {resetWebCam} = useWebCamStore()
    const {resetRemoteControl} = useRemoteControlStore();

    const count = useRef(0);
    const debouncedGetCPUInfo = useMemo(() =>
        debounce((query) => {
            const {tcpDataChannel} = useStreamsAndConnectionStore.getState();
            const {resourceActive} = useResourcesStore.getState();
            if (resourceActive && tcpDataChannel) {
                tcpDataChannel.send(JSON.stringify({type: "get_dynamic_cpu_info"}));
            }
        }, 1000), [])
    
    const debouncedGetHandles = useMemo(() =>
        debounce((query) => {
            const {tcpDataChannel} = useStreamsAndConnectionStore.getState();
            const {activeTab, resourceActive} = useResourcesStore.getState();
            if (activeTab === 'cpu' && resourceActive && tcpDataChannel) {
                tcpDataChannel.send(JSON.stringify({type: "get_threads_and_handles"}));
            }
        }, 3000), [])

    const debouncedGetProcesses = useMemo(() =>
        debounce((query) => {
            const {tcpDataChannel} = useStreamsAndConnectionStore.getState();
            const {activeTab, resourceActive} = useResourcesStore.getState();
            if (activeTab === 'process' && resourceActive && tcpDataChannel) {
                tcpDataChannel.send(JSON.stringify({type: "get_processes"}));
            }
        }, 3000), [])
    
    const debouncedGetMemoryInfo = useMemo(() =>
        debounce((query) => {
            const {tcpDataChannel} = useStreamsAndConnectionStore.getState();
            const {resourceActive} = useResourcesStore.getState();
            if (resourceActive && tcpDataChannel) {
                tcpDataChannel.send(JSON.stringify({type: "get_dynamic_memory_info"}));
            }
        }, 1000), [])

    const initializeWebRTC = () => {        
        // Close existing connection if it exists
        if (peerConnection) {
            peerConnection.close();
        }
        
        // Create new RTCPeerConnection
        const newPeerConnection = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' }
            ]
        });
        
        // Set it in the store
        setPeerConnection(newPeerConnection);
        
        // Addding ICE candidate handler
        newPeerConnection.onicecandidate = (event) => {
            if (event.candidate && socket?.current) {
                console.log("Sending ICE candidate to device");
                socket.current.emit("webrtc-ice-candidate", {
                    deviceId,
                    ice: event.candidate,
                });
            } else if (!event.candidate) {
                console.log("ICE gathering completed");
            }
        };
                
        // Set up track handler on the new connection
        newPeerConnection.ontrack = (event) => {
            console.log("Received track from device", event.track.kind);
            if (event.track.kind === "video") {
                const stream = new MediaStream([event.track]);
                const currentState = useStreamsAndConnectionStore.getState();
                if (!currentState.screenStream) {
                    console.log("Setting screen video");
                    setScreenStream(stream);
                } else if (!currentState.webcamStream) {
                    console.log("Setting webcam video");
                    setWebcamStream(stream);
                }
            } else if (event.track.kind === "audio") {
                console.log("Setting audio stream");
                const stream = new MediaStream([event.track]);
                setAudioStream(stream);
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
                setAudioStream(null);
            }
        };

        // Set up data channel handler
        newPeerConnection.ondatachannel = (event) => {
            const dChannel = event.channel;
            console.log(`Received data channel: ${dChannel.label}`);
            
            if (dChannel.label === "tcp") {
                console.log("TCP Data channel established");
                setTcpDataChannel(dChannel);
                
                dChannel.onopen = () => {
                    console.log("TCP Data channel open");
                    dChannel.send(JSON.stringify({ type: 'get_user_and_path'}));
                };
                
                dChannel.onmessage = (e) => {
                    try {
                        const parsed_data = JSON.parse(e.data);
                        const {xtermInstance} = useTerminalStore.getState();
                        
                        if (parsed_data.type === "get_files_response") {
                            addFilesToPath(parsed_data.path, parsed_data.files);
                            setIsRefreshing(false);
                        }
                        else if (parsed_data.type === "delete_files_response") {
                            setIsRefreshing(false);
                            setSelectedFiles([]);
                            updateFilesToPath(parsed_data.path, parsed_data.files);
                            toast.success("Files deleted successfully");
                        }
                        else if (parsed_data.type === "zip_start") {
                            console.log("ZIP download started, size:", parsed_data.size);
                            setDownloadFileSize(getReadableSize(parsed_data.size));
                            window.zipDownload = {
                                buffer: new Uint8Array(parsed_data.size),
                                receivedBytes: 0,
                                totalSize: parsed_data.size,
                                startTime: Date.now(),
                                chunksReceived: 0,
                                lastProgress: 0
                            };
                            setIsDownloading(true);
                            toast.success("Download started");
                        } 
                        else if (parsed_data.type === "zip_chunk") {
                            if (!window.zipDownload) {
                                console.error("Received chunk but no download initialized");
                                return;
                            }
                            
                            try {
                                // Decode base64 back to bytes
                                const chunk = Uint8Array.from(atob(parsed_data.data), c => c.charCodeAt(0));
                                
                                // Validate chunk
                                if (parsed_data.offset + chunk.length > window.zipDownload.totalSize) {
                                    console.error("Chunk exceeds expected file size");
                                    return;
                                }
                                
                                // Add chunk to buffer
                                window.zipDownload.buffer.set(chunk, parsed_data.offset);
                                window.zipDownload.receivedBytes += chunk.length;
                                window.zipDownload.chunksReceived++;

                                setDownloadedFileSize(getReadableSize(window.zipDownload.receivedBytes));
                                
                                const {tcpDataChannel} = useStreamsAndConnectionStore.getState();
                                tcpDataChannel.send(JSON.stringify({
                                    type: 'zip_ack',
                                    offset: parsed_data.offset
                                }));
                                
                                const progress = (window.zipDownload.receivedBytes / window.zipDownload.totalSize) * 100;
                                setDownloadProgress(Math.round(progress));
                                console.log(`Download progress: ${progress.toFixed(1)}%`);
                            } catch (error) {
                                console.error("Error processing chunk:", error);
                                toast.error("Error processing download chunk");
                            }
                        } 
                        else if (parsed_data.type === "zip_end") {
                            console.log("ZIP download completed");
                            
                            if (window.zipDownload) {
                                const downloadTime = (Date.now() - window.zipDownload.startTime) / 1000;
                                const speed = (window.zipDownload.totalSize / downloadTime / 1024).toFixed(1);
                                                                
                                // Verify we received all data
                                if (window.zipDownload.receivedBytes !== window.zipDownload.totalSize) {
                                    console.warn(`Size mismatch: expected ${window.zipDownload.totalSize}, got ${window.zipDownload.receivedBytes}`);
                                    toast.warning("Download may be incomplete");
                                }
                                
                                // Create and download the file
                                const blob = new Blob([window.zipDownload.buffer], { type: 'application/zip' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'downloaded_files.zip';
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                                
                                // Cleanup
                                delete window.zipDownload;
                                toast.success("Download completed successfully");
                            }
                            setNumDownloadingFiles(0);
                            setDownloadProgress(0);
                            setIsDownloading(false);
                        }
                        else if (parsed_data.type === "zip_error") {
                            console.error("Server reported zip error:", parsed_data.message);
                            toast.error(`Download failed: ${parsed_data.message}`);
                            setIsDownloading(false);
                            if (window.zipDownload) {
                                delete window.zipDownload;
                            }
                        } 
                        else if (parsed_data.type === "terminal_cd") {
                            setCurrentPath(parsed_data.path);
                            addToTerminalExecutions({
                                command: parsed_data.command,
                                output: parsed_data.path,
                                isError: false,
                                timestamp: new Date().toISOString()
                            });
                            xtermInstance.write(`\x1b[32mChanged directory to: ${parsed_data.path}\x1b[0m\r\n`);
                            xtermInstance.write(getPrompt());
                            xtermInstance.focus();
                            setIsExecuting(false);
                        }
                        else if (parsed_data.type === "terminal_cmd") {
                            const output = parsed_data.output;
    
                            const lines = output.split(/\r?\n/);
                            
                            lines.forEach((line, index) => {
                                if (line.trim()) {
                                    xtermInstance.write(line);
                                }
                                
                                if (index < lines.length - 1) {
                                    xtermInstance.write('\r\n');
                                }
                            });
                            
                            if (!output.endsWith('\n') && !output.endsWith('\r\n')) {
                                xtermInstance.write('\r\n');
                            }
                            
                            xtermInstance.write(getPrompt());
                            xtermInstance.focus();
                            addToTerminalExecutions({
                                command: parsed_data.command,
                                output: parsed_data.output,
                                isError: false,
                                timestamp: new Date().toISOString()
                            });
                            setIsExecuting(false);
                        }
                        else if (parsed_data.type === "terminal_error") {
                            const errorMessage = parsed_data.message;
    
                            const formattedError = errorMessage
                                .replace(/\r\n/g, '\r\n')
                                .replace(/\n/g, '\r\n') 
                                .replace(/\t/g, '    ');
                            
                            xtermInstance.write(`\x1b[31m${formattedError}\x1b[0m`);
                            
                            if (!formattedError.endsWith('\r\n') && !formattedError.endsWith('\n')) {
                                xtermInstance.write('\r\n');
                            }
                            
                            xtermInstance.write(getPrompt());
                            xtermInstance.focus();
                            
                            addToTerminalExecutions({
                                command: parsed_data.command,
                                output: parsed_data.message,
                                isError: true,
                                timestamp: new Date().toISOString()
                            });
                            setIsExecuting(false);
                        }
                        else if (parsed_data.type === "user_and_path") {
                            setSystemUserName(parsed_data.user);
                            setCurrentPath(parsed_data.path);
                        }
                        else if (parsed_data.type === "static_cpu_info") {
                            setStaticCPUInfo(parsed_data.cpu_info);
                        }
                        else if (parsed_data.type === "dynamic_cpu_info") {
                            const {dynamicCPUInfo} = useResourcesStore.getState();
                            setDynamicCPUInfo({...dynamicCPUInfo, ...parsed_data.cpu_info});
                            addToCPUChartData(parsed_data.cpu_info.utilization);
                            console.log("Count: ", count.current);
                            count.current++;
                            debouncedGetCPUInfo()
                        }
                        else if (parsed_data.type === "threads_and_handles") {
                            const {threads, handles} = parsed_data.data;
                            const {dynamicCPUInfo} = useResourcesStore.getState();
                            setDynamicCPUInfo({...dynamicCPUInfo, threads, handles});
                            debouncedGetHandles();
                        }
                        else if (parsed_data.type === "static_memory_info") {
                            setStaticMemoryInfo(parsed_data.memory_info);
                        }
                        else if (parsed_data.type === "dynamic_memory_info") {
                            setDynamicMemoryInfo(parsed_data.memory_info);
                            addToMemoryChartData(parsed_data.memory_info.utilization);
                            debouncedGetMemoryInfo();
                        }
                        else if (parsed_data.type === "processes") {
                            const processes = parsed_data.processes;
                            setProcessesList(processes);
                            debouncedGetProcesses();
                        }
                        else if (parsed_data.type === "error") {
                            toast.error(parsed_data.message || "An error occurred");
                            setIsDownloading(false);
                        }
                        
                    } catch (error) {
                        console.error("Error parsing TCP message:", error);
                        toast.error("Error processing server message");
                    }
                };
                
                dChannel.onerror = (error) => {
                    console.error("TCP Data channel error:", error);
                    toast.error("Data transfer failed");
                    setIsDownloading(false);
                    if (window.zipDownload) {
                        delete window.zipDownload;
                    }
                };

                dChannel.onclose = () => {
                    console.log("TCP Data channel closed");
                    setTcpDataChannel(null);
                    setIsDownloading(false);
                    if (window.zipDownload) {
                        console.log("Download interrupted - channel closed");
                        delete window.zipDownload;
                    }
                };
                
            } else if (dChannel.label === "udp") {
                console.log("UDP Data channel established");
                setUdpDataChannel(dChannel);

                dChannel.onopen = () => {
                    console.log("UDP Data channel open");
                };

                dChannel.onmessage = (e) => {
                    console.log("UDP Message from Python:", e.data);
                };
                
                dChannel.onclose = () => {
                    console.log("UDP Data channel closed");
                    setUdpDataChannel(null);
                };
            }
        };

        // Set up ICE connection state handler
        newPeerConnection.oniceconnectionstatechange = () => {
            console.log("ICE Connection State:", newPeerConnection.iceConnectionState);
        };
        
        // Return the new connection for immediate use
        return newPeerConnection;
    };

    useEffect(() => {
        if (!socket?.current || !isSocketConnected) return;

        console.log("Setting up socket listeners");

        const handleWebRTCOffer = async (data) => {
            console.log("Received WebRTC offer from device", data);
            try {
                let currentPeerConnection = peerConnection;
                
                // Make sure we have a fresh WebRTC connection
                if (!currentPeerConnection || currentPeerConnection.connectionState === "closed") {
                    currentPeerConnection = initializeWebRTC();
                }

                await currentPeerConnection.setRemoteDescription(data.offer);
                const answer = await currentPeerConnection.createAnswer();
                await currentPeerConnection.setLocalDescription(answer);
                
                socket.current.emit("webrtc-answer", {
                    deviceId,
                    answer: currentPeerConnection.localDescription,
                });
                console.log("Sent WebRTC answer to device");
            } catch (error) {
                console.error("Error handling WebRTC offer:", error);
                setConnectButtonState({inProcess: false, text: "Connect"});
            }
        };

        const handleICECandidate = async (data) => {
            console.log("Received ICE candidate from device");
            try {
                if (peerConnection && data.ice) {
                    await peerConnection.addIceCandidate(new RTCIceCandidate(data.ice));
                    console.log("Added ICE candidate from device");
                }
            } catch (error) {
                console.error("Failed to add ICE candidate:", error);
            }
        };

        const handleStopWebRTC = (deviceIssue = false) => {
            console.log("Stopping WebRTC connection");
            setScreenStream(null);
            setWebcamStream(null);
            setAudioStream(null);
            setTcpDataChannel(null);
            setUdpDataChannel(null);
            
            if (peerConnection) {
                peerConnection.close();
                setPeerConnection(null);
            }
            
            if (deviceIssue) {
                toast.error("Device disconnected or unavailable");
            }
            setConnectButtonState({inProcess: false, text: "Connect"});
        };

        // Socket event listeners
        socket.current.on("webrtc-offer", handleWebRTCOffer);
        socket.current.on("webrtc-ice-candidate", handleICECandidate);
        socket.current.on("stopped-webrtc", handleStopWebRTC);
        socket.current.on("stop-webrtc", () => handleStopWebRTC(true));
        socket.current.on("permissions", (data) => {
            const updatedPermissions = Object.entries(data.permissions).map(([key, allowed]) => ({
                key: key,
                value: {
                    allowed: allowed,
                    shortDescription: permissionDesriptions[key]?.shortDescription || "Unknown permission",
                    longDescription: permissionDesriptions[key]?.longDescription || "No description available"
                }
            }));
            setPermissions(updatedPermissions);
            console.log("Received permissions from device:", updatedPermissions);

        })
        socket.current.on("error", (data) => {
            toast.error(data.message || "An error occurred");
            setConnectButtonState({
                inProcess: false, 
                text: (peerConnection?.connectionState === "connected") ? "Disconnect" : "Connect"
            });
        });

        return () => {
            if (socket.current) {
                socket.current.off("webrtc-offer", handleWebRTCOffer);
                socket.current.off("webrtc-ice-candidate", handleICECandidate);
                socket.current.off("stopped-webrtc", handleStopWebRTC);
                socket.current.off("stop-webrtc");
                socket.current.off("error");
                socket.current.off("permissions");
            }
        };

    }, [socket, isSocketConnected, deviceId, peerConnection]);

    useEffect(() => {
        if (!socket?.current || !isSocketConnected) return;
        socket.current.on("device-status", (data) => {
          console.log("Device online event received:", data);
          const {updateDeviceInfo, deviceInfo} = useDeviceProfileStore.getState();
          if (deviceInfo?.deviceId === data.deviceId) {
            updateDeviceInfo({status: data.status});
          }
        });
    
        return () => {
          socket.current.off("device-status");
        }
    }, [socket.current, isSocketConnected])

    useEffect(() => {
        async function fetchDeviceData() {
          const clerk_token = await getToken();
          try {
            const response = await apiClient.get(`/devices/${deviceId}`, {
              headers: { Authorization: `Bearer ${clerk_token}` }
            });
            setDeviceInfo(response.data.deviceInfo);
            setPermissions(response.data.permissions);
          } catch (error) {
            console.error("Error fetching device data:", error);
          }
        }
        if (deviceInfo && permissions) return;
        fetchDeviceData();
      }, [])
    
    useEffect(() => {
        return () => {
            resetDeviceProfile();
            resetFileStore();
            resetStreamsAndConnection();
            resetTerminal();
            resetResources();
            resetWebCam();
            resetRemoteControl();
            
            debouncedGetCPUInfo.cancel();
            debouncedGetHandles.cancel();
            debouncedGetProcesses.cancel();
            debouncedGetMemoryInfo.cancel();
        }
    }, [])

    const handleConnect = () => {
        if (!socket?.current || !isSocketConnected) {
            console.error("Socket not connected");
            return;
        }

        if (peerConnection?.connectionState === "connected") {
            console.log("Disconnecting from stream");
            socket.current.emit("stop-webrtc");
            setConnectButtonState({inProcess: true, text: "Disconnecting..."});
            
            setScreenStream(null);
            setWebcamStream(null);
            
            if (peerConnection) {
                peerConnection.close();
                setPeerConnection(null);
            }
            
        } else {
            console.log("Requesting stream start for device:", deviceId);
            
            // Initialize and get the new connection
            const newConnection = initializeWebRTC();
            
            socket.current.emit("initiate-webrtc", {
                deviceId,
            });
            setConnectButtonState({inProcess: true, text: "Connecting..."});
        }
    };

    const defineNavItem = (item) => {
        let path = `/device/${deviceId}${item.href}`
        let disabled = false
        if (!permissions && item.id !== "profile" ){
            disabled = true;
            path = "#";
        } else if (item.id === "remoteControl" && !permissions[0].value.allowed && !permissions[1].value.allowed){
            disabled = true;
            path = "#";
        } else if (item.id === "terminalAccess" && !permissions[2].value.allowed){
            disabled = true;
            path = "#"
        } else if (item.id === "fileAccess" && !permissions[3].value.allowed){
            disabled = true;
            path = "#"
        } else if (item.id === "webcamFeed" && !permissions[4].value.allowed){
            disabled = true
            path = "#"
        } else if (item.id === "resourceMonitor" && !permissions[5].value.allowed){
            disabled = true
            path = "#"
        }
        return {path , disabled }
    }

  return (  
    <>
        <div className='flex bg-dark-3 h-[100vh]'>
            <div className='flex flex-col justify-between items-start h-full w-60 md:w-70'>
                <Link href={"/console"} className="flex items-center gap-[2px] pr-10 pl-3 pt-5 mb-6">
                    <Image src="/logo.svg" alt="GhostSocket" width={45} height={45} />
                    <h1 className="text-2xl font-bold text-white">GhostSocket</h1>                                  
                </Link>
                <div className="flex flex-col justify-between w-full  p-2 h-full">
                    <div className='flex flex-col h-full'>
                        <ul className="flex flex-col gap-3 mr-2 ml-1 flex-1">
                            {navItems.map((item) => {
                                const {path, disabled} = defineNavItem(item); 
                                return (
                                <li key={item.name}>
                                <Link
                                    href={path}
                                    className={`flex gap-2 items-center rounded-lg p-2 transition-colors ${
                                    pathname === path
                                        ? "bg-purple-1"
                                        : (!disabled && "hover:bg-white/10")
                                    } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
                                >
                                    <item.icon size={22} className={`${pathname === path ? "invert brightness-0" : "text-purple-1"}`}/>
                                    <span className="text-white text-md font-medium">{item.name}</span>
                                </Link>
                                </li>
                            )})}
                        </ul>
                    </div>
                    <div className='flex flex-col w-full gap-4'>
                        <Button 
                        ref={connectBtn} 
                        onClick={handleConnect} 
                        className={`${connectButtonState.text === "Disconnect" ? 
                            "bg-primary-red hover:bg-primary-red-hover": 
                            "bg-purple-1 hover:scale-103"}
                            items-center disabled:bg-gray-400 cursor-pointer font-semibold disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300`}
                        disabled={!isSocketConnected || connectButtonState.inProcess}
                        >
                            {connectButtonState.text}
                        </Button>
                        <div className='h-[1px] bg-dark-5 mt-1'/>
                        <div className="flex items-center gap-2 pb-2">
                            <FaWindows className="text-4xl text-blue-500 mr-0" />
                            <div className="flex justify-center flex-col">
                                <h2 className="font-semibold text-xl overflow-hidden text-ellipsis w-[150px] md:w-[200px] whitespace-nowrap">{deviceInfo?.name}</h2>
                                <div className="flex items-center gap-1">
                                    <div className={`w-2 h-2 rounded-full ${statusColors[deviceInfo?.status]}`} />
                                    <p className="text-gray-500 text-sm overflow-hidden text-ellipsis w-[150px] md:w-[200px] whitespace-nowrap">{deviceInfo?.os}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            

            <div className='w-[1px]  bg-dark-5 h-[100vh]'></div>

            <div className='flex-1 bg-dark-1'>
                {children}
            </div>
        </div>
    </>
  )
}

export default ControlPanelLayout

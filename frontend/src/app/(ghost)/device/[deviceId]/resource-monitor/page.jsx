"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import React, { useEffect, useRef, useState } from 'react'
import { CpuLayout} from "./CpuMonitor";
import { MemoryLayout } from "./MemoryMonitor";
import ProcessMonitor from "./ProcessMonitor";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { useStreamsAndConnectionStore } from "@/store/slices/ActiveConnection/StreamsAndConnectionSlice";
import { useSocket } from "@/context/SocketContext";
import { useResourcesStore } from "@/store/slices/ActiveConnection/ResourcesSlice";
import { useDeviceProfileStore } from "@/store/slices/ActiveConnection/DeviceProfileSlice";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

const ResourceMonitorPage = () => {
    const {deviceId} = useParams(); 
    const {setResourceActive} = useResourcesStore()
    const {tcpDataChannel} = useStreamsAndConnectionStore();
    const {socket} = useSocket()
    
    const router = useRouter()
    const {permissions} = useDeviceProfileStore();
    useEffect(() => {
        const {permissions} = useDeviceProfileStore.getState();
        console.log("Resource Monitor Permissions: ", permissions);
        if (permissions !== null && !permissions[5].value.allowed) {
            router.push(`/device/${deviceId}/device-profile`);
            toast.error("You do not have permission to access the Resource Monitor.");
        }
    }, [permissions])
    
    useEffect(() => {
        if (!socket?.current) return;
        socket.current.emit("to-device", {message: "pause_screen"})
        socket.current.emit("to-device", {message: "pause_webcam"})
        socket.current.emit("to-device", {message: "pause_audio"})
    }, [])
    useEffect(() => {
        if (!tcpDataChannel) return;    
        tcpDataChannel.send(JSON.stringify({type: "get_static_memory_info"}));
        tcpDataChannel.send(JSON.stringify({type: "get_dynamic_cpu_info"}));
        tcpDataChannel.send(JSON.stringify({type: "get_dynamic_memory_info"}));
        tcpDataChannel.send(JSON.stringify({type: "get_threads_and_handles"}));        
        return () => {
        };
    }, [tcpDataChannel])
    useEffect(() => {
        setResourceActive(true);
        return () => {
            setResourceActive(false);
        }
    }, [setResourceActive])
  return (
    <div className="flex flex-col h-[100vh] p-3 pb-0 pr-0">
        <div className="text-white text-3xl font-bold mb-2 shrink-0">
            Resource Monitor
        </div>
        <Tabs defaultValue={"cpu"} className="w-full flex-1 overflow-hidden">
            <TabsList className="mb-2">
                <TabsTrigger value="cpu" className="data-[state=active]:font-bold data-[state=active]:bg-black font-md text-md opacity-75 data-[state=active]:opacity-100 cursor-pointer">CPU</TabsTrigger>
                <TabsTrigger value="memory" className="data-[state=active]:font-bold data-[state=active]:bg-black  font-md text-md opacity-75 data-[state=active]:opacity-100 cursor-pointer">Memory</TabsTrigger>
                <TabsTrigger value="process" className="data-[state=active]:font-bold data-[state=active]:bg-black font-md text-md opacity-75 data-[state=active]:opacity-100 cursor-pointer">Processes</TabsTrigger>
            </TabsList>
            <ScrollArea className="overflow-y-auto custom-scrollbar">
                <TabsContent value="cpu">
                    <CpuLayout />
                </TabsContent>
                <TabsContent value="memory">
                    <MemoryLayout />
                </TabsContent>
            </ScrollArea>
            <TabsContent value="process">
                <ProcessMonitor />
            </TabsContent>
        </Tabs>
    </div>
  )
}

export default ResourceMonitorPage

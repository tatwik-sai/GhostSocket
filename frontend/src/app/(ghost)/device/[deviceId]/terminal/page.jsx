"use client"

import { useSocket } from '@/context/SocketContext';
import { useDeviceProfileStore } from '@/store/slices/ActiveConnection/DeviceProfileSlice';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

const DynamicClientTerminal = dynamic(() => import('./TerminalClient'), {
  ssr: false, 
  loading: () => (
    <div className="flex flex-col h-[100vh] p-3 pb-0 pr-0">
      <div className="text-white text-3xl font-bold mb-2">
        Remote Console
      </div>
      <div className="h-full w-full bg-dark-4 mb-4"></div>
      <div className="flex-1 flex items-center justify-center">
        <p className="text-white text-center">Loading terminal...</p>
      </div>
    </div>
  ),
});

export default function TerminalPage() {
  const {deviceId} = useParams();
  const {socket} = useSocket();
  const router = useRouter()
  const {permissions} = useDeviceProfileStore();
  useEffect(() => {
      const {permissions} = useDeviceProfileStore.getState();
      console.log("Resource Monitor Permissions: ", permissions);
      if (permissions !== null && !permissions[2].value.allowed) {
          router.push(`/device/${deviceId}/device-profile`);
          toast.error("You do not have permission to access the Terminal.");
      }
  }, [permissions])
  useEffect(() => {
    if (socket?.current){
    socket.current.emit("to-device", {message: "pause_screen"});
    socket.current.emit("to-device", {message: "pause_webcam"});
    socket.current.emit("to-device", {message: "pause_audio"});
    }
  }, [socket?.current]);
  return <DynamicClientTerminal />;
}
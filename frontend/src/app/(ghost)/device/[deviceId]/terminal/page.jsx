"use client"

import { useSocket } from '@/context/SocketContext';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';

const DynamicClientTerminal = dynamic(() => import('./TerminalClient'), {
  ssr: false, 
  loading: () => (
    <div className="flex flex-col h-[100vh] p-3 pb-0 pr-0">
      <div className="text-white/80 text-3xl font-bold mb-2">
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
  const {socket} = useSocket();
  useEffect(() => {
    if (socket?.current){
    socket.current.emit("to-device", {message: "pause_screen"});
    socket.current.emit("to-device", {message: "pause_webcam"});
    socket.current.emit("to-device", {message: "pause_audio"});
    }
  }, [socket?.current]);
  return <DynamicClientTerminal />;
}
import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation';
import { MdDelete } from "react-icons/md";
import { Button } from '@/components/ui/button'
import { FaWindows, FaUbuntu } from "react-icons/fa";
import { MdModeEdit } from "react-icons/md";
import { FiMoreVertical } from "react-icons/fi";
import { CiGlobe } from "react-icons/ci";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSocket } from '@/context/SocketContext';


const DevicesList = ({type, devices}) => {
  console.log("Filtered Devices:", devices);
  const scrollRef = useRef(null);
  const router = useRouter();
  const socket = useSocket()
  const statusColors = {
    online: "bg-blue-500",
    offline: "bg-gray-500",
  };

  useEffect(() => {
      const container = scrollRef.current;
      const handleWheel = (e) => {
        if (e.deltaY !== 0) {
          e.preventDefault();
          container.scrollLeft += e.deltaY;
        }
      };

      container.addEventListener("wheel", handleWheel);  
      return () => {
        container.removeEventListener("wheel", handleWheel);
      }
    }, []);

  const scroll = (direction) => {
    const scrollAmount = 370;
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleCardClick = (deviceId) => {
    router.push(`/device/${deviceId}`);
  };

  const handleConnect = (deviceId) => {
    console.log("Connecting to device:", deviceId);
    socket.emit("initiate-webrtc", {
      deviceId
    });
  };

  return (
    <>
        <div className="flex justify-start items-center gap-2 mb-2 pl-4">
        <button onClick={() => scroll("left")} className="bg-dark-4 hover:bg-zinc-700 p-2 rounded-md active:scale-90 transition-all duration-100">
          <ChevronLeft className="h-5 w-5 text-white"/>
        </button>
        <button onClick={() => scroll("right")} className="bg-dark-4 hover:bg-zinc-700 p-2 rounded-md  active:scale-90 transition-all duration-100">
          <ChevronRight className="h-5 w-5 text-white" />
        </button>
      </div>
      {/* Scroll */}
      <div className="w-full rounded-md overflow-x-auto p-2 hide-scroll-bar" ref={scrollRef}>
        <div className="flex w-max space-x-4 p-2" style={{ scrollBehavior: "smooth" }}>
          {devices.length !== 0 && devices.map((device) => (
            <div key={device._id} className="bg-dark-3 flex-col p-3 rounded-xl border-dark-4 border-[1px] hover:scale-105  active:scale-100 transition-all duration-200" onClick={() => handleCardClick(device._id)}>
              <div className="flex justify-between items-center gap-25">
                <div className="flex gap-2 items-center">
                    {console.log("Device OS:", device.os)}
                  {device.os?.toLowerCase().includes("ubuntu") ?
                    <FaUbuntu className="w-6 h-6" /> : <FaWindows className="w-6 h-6" />}
                  <p className="font-semi-bold text-lg text-ellipsis w-[150px] whitespace-nowrap overflow-hidden">{device.name}</p>
                  <MdModeEdit className="opacity-40 hover:scale-[1.15] hover:opacity-100 active:scale-95 transition-all duration-300"  onClick={(e) => e.stopPropagation()}/>
                </div>
                <FiMoreVertical className="w-5 h-5 opacity-40 hover:scale-[1.15] hover:opacity-100 active:scale-90 transition-all duration-100"  onClick={(e) => e.stopPropagation()}/>
              </div>
              <div className="flex gap-1 items-center justify-start pl-8">
                <div className={`w-2 h-2 rounded-full ${statusColors[device.status]}`} />
                <p className="text-sm text-gray-400">{device.status}</p>
              </div>
              <div className="flex flex-col pt-4 gap-0">
                <p className="text-sm text-gray-400">{`last seen ${"2 mins ago"}`}</p>
                <p className="text-sm text-gray-400">{`${device.os}`}</p>
                <p className="text-sm text-gray-400">{`IP ${"192.168.10.1"}`}</p>
                <div className="flex gap-1 items-center justify-start">
                  <CiGlobe className="w-4 h-4"/>
                  <p className="text-sm text-gray-400">{"Mumbai, India"}</p>
                </div>
              </div>
              <div className="flex justify-between items-center mt-23">
                <div className="flex gap-2">
                  {device.connected ? 
                  <Button className="bg-primary-red hover:bg-primary-red-hover font-semibold active:scale-90 transition-all duration-100"
                  onClick={(e) => e.stopPropagation()}>Disconnect</Button>
                  : <Button className="bg-blue-500 hover:bg-blue-600 font-semibold active:scale-90 transition-all duration-100"
                  onClick={(e) => {e.stopPropagation(); handleConnect(device._id)}}>Connect</Button>
                  }
                  <Button className="bg-dark-5/70 hover:bg-dark-5/100 active:scale-90 transition-all duration-100"
                   onClick={(e) => e.stopPropagation()}>Manage</Button>
                </div>
                <MdDelete  onClick={(e) => e.stopPropagation()} className="h-5 w-5 hover:text-red-500 hover:scale-[1.25] active:scale-90 transition-all duration-100"/>
              </div>
            </div>
          ))}
          {devices.length === 0 && (
            <div className="flex items-center justify-center h-64 w-full text-gray-500">
              <p>No devices found</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default DevicesList
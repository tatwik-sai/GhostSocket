"use client"
import React, { useEffect } from 'react'
import { useAuth, UserButton, useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/apiClient'
import axios from 'axios'
import Viewer from '@/components/Viewer'
import { useState } from 'react'
import { IoSearch } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import Link from 'next/link'
import { FaWindows } from "react-icons/fa";
import { MdModeEdit } from "react-icons/md";
import { FiMoreVertical } from "react-icons/fi";
import { CiGlobe } from "react-icons/ci";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useRouter } from 'next/navigation';
import DevicesList from '@/components/DevicesList'
import { useDevicesStore } from '@/store/slices/devices-slice'

export default function DeviceSlider() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { myDevices, otherDevices, setMyDevices, setOtherDevices } = useDevicesStore();
  const [searchMy, setSearchMy] = useState("");
  const [searchOther, setSearchOther] = useState("");
  const dummyMyDevices = [
    { id: 1, name: "Ghost_PC_01", status: "online", os: "Windows 11", connected: false },
    { id: 2, name: "Ghost_Laptop", status: "offline", os: "Ubuntu 22.04", connected: true },
    { id: 3, name: "Ghost_PC_01", status: "online", os: "Windows 11", connected: true  },
    { id: 4, name: "Ghost_Laptop", status: "offline", os: "Ubuntu 22.04", connected: true  },
    { id: 5, name: "Ghost_PC_01", status: "online", os: "Windows 11", connected: true  },
    { id: 6, name: "Ghost_Laptop", status: "offline", os: "Ubuntu 22.04", connected: false },
    { id: 7, name: "Ghost_PC_01", status: "online", os: "Windows 11", connected: true  },
    { id: 8, name: "Ghost_Laptop", status: "offline", os: "Ubuntu 22.04", connected: false },
  ];
  const dummyOtherDevices = [
    { id: 1, name: "DevTest PC", status: "offline", owner: "Alice", connected: true },
    { id: 2, name: "RemoteServer_02", status: "offline", owner: "Bob", connected: true },
    { id: 3, name: "DevTest_PC", status: "online", owner: "Alice", connected: false },
    { id: 4, name: "RemoteServer_02", status: "online", owner: "Bob", connected: true },
    { id: 5, name: "RemoteServer_02", status: "offline", owner: "Bob", connected: true },
    { id: 6, name: "DevTest_PC", status: "online", owner: "Alice", connected: false },
    { id: 7, name: "RemoteServer_02", status: "online", owner: "Bob", connected: true },
  ];

  useEffect(() => {
    setMyDevices(dummyMyDevices);
    setOtherDevices(dummyOtherDevices);
  }, [setMyDevices, setOtherDevices]);

  const handleClick = async () => {
    if(!user) return;
    const clerk_token = await getToken();

    try {
      console.log(clerk_token)
      const response = await axios.get("http://localhost:8747/protected",
        {
          headers: {
            Authorization: `Bearer ${clerk_token}`,
          },
        }
      );

      console.log("Response from backend:", response.data);
    } catch (err) {
      console.error("Error contacting backend:", err.response?.data || err);
    }
  };

  const filteredMyDevices = myDevices.filter(device =>
    device.name.toLowerCase().includes(searchMy.toLowerCase()) ||
    device.status.toLowerCase().includes(searchMy.toLowerCase()) ||
    device.os.toLowerCase().includes(searchMy.toLowerCase())
  );

  const filteredOtherDevices = otherDevices.filter(device =>
    device.name?.toLowerCase().includes(searchOther.toLowerCase()) ||
    device.status?.toLowerCase().includes(searchOther.toLowerCase()) ||
    device.os?.toLowerCase().includes(searchOther.toLowerCase())
  );

  return (
  <div className="h-[100vh] md:p-4 space-y-15">
    <div className="flex-col flex-1">
      <div className="flex justify-between mt-4 mb-3 pl-4">
      <h2 className="text-2xl font-bold pb-2 whitespace-nowrap pr-4">My Devices</h2>
        <div className="relative w-70">
          <input
            type="text"
            placeholder="Search..."
            value={searchMy}
            onChange={e => setSearchMy(e.target.value)}
            className="bg-dark-3 h-10 p-2 w-full text-sm focus:outline-none pl-9 rounded-lg focus:ring-2 focus:ring-white/30"
          />
          <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
            <IoSearch className="h-5 w-5" />
          </span>
        </div>
      </div>
      <DevicesList type="myDevices" devices={filteredMyDevices} />
    </div>
    
    <div className="flex-col flex-1">
      <div className="flex justify-between mt-4 mb-3 pl-4">
      <h2 className="text-2xl font-bold pb-2 whitespace-nowrap pr-4">Other Devices</h2>
        <div className="relative w-70">
          <input
            type="text"
            placeholder="Search..."
            value={searchOther}
            onChange={e => setSearchOther(e.target.value)}
            className="bg-dark-3 h-10 p-2 w-full text-sm focus:outline-none pl-9 rounded-lg focus:ring-2 focus:ring-white/30"
          />
          <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
            <IoSearch className="h-5 w-5" />
          </span>
        </div>
      </div>
      <DevicesList type="otherDevices" devices={filteredOtherDevices} />  
    </div>  
  </div>
  )
}

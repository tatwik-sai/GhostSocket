"use client"
import React, { useEffect } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { apiClient } from '@/lib/apiClient'
import { useState } from 'react'
import { IoSearch } from "react-icons/io5";
import DevicesList from '@/components/DevicesList'
import { useDevicesStore } from '@/store/slices/DevicesSlice'
import { useSocket } from '@/context/SocketContext'

export default function DevicesPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const {socket, isConnected} = useSocket()
  const { myDevices, otherDevices, setMyDevices, setOtherDevices, updateDeviceOnlineStatus } = useDevicesStore();
  const [searchMy, setSearchMy] = useState("");
  const [searchOther, setSearchOther] = useState("");
  let clerk_token, authHeaders;

  useEffect(() => {
    if (!socket?.current || !isConnected) return;
    socket.current.on("device-status", (data) => {
      updateDeviceOnlineStatus(data.deviceId, data.status === "online");
    });

    return () => {
      socket.current.off("device-status");
    }
  }, [socket.current, isConnected])

  useEffect(() => {
    async function fetchData() {
      clerk_token = await getToken();
      authHeaders = {
        headers: {
          Authorization: `Bearer ${clerk_token}`,
        },
      };
      const myDevicesData = await apiClient.get("/devices/my", authHeaders);
      const otherDevicesData = await apiClient.get("/devices/other", authHeaders);
      setMyDevices(myDevicesData.data);
      setOtherDevices(otherDevicesData.data);
    }
    fetchData()
  }, [setMyDevices, setOtherDevices, user]);

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
  <div className="flex flex-col justify-between lg:p-4 h-full">
    <div className="flex flex-col flex-1 bg-dark-1">
      <div className="flex justify-between w-full mt-2 lg:mt-4 mb-3 p-2 md:pl-4">
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
    
    <div className="flex flex-col flex-1 bg-dark-1">
      <div className="flex justify-between mt-2 lg:mt-4 mb-3 p-2 md:pl-4">
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

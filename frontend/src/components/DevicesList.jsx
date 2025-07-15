import React, { use, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation';
import { MdDelete, MdHistory } from "react-icons/md";
import { Button } from '@/components/ui/button'
import { FaWindows, FaUbuntu, FaGooglePlus, FaPlus, FaPlusCircle } from "react-icons/fa";
import { MdModeEdit } from "react-icons/md";
import { FiMoreVertical } from "react-icons/fi";
import { CiCirclePlus, CiGlobe } from "react-icons/ci";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSocket } from '@/context/SocketContext';
import { Input } from "@/components/ui/input"
import { useDevicesStore } from '@/store/slices/DevicesSlice';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { IoMdAddCircle, IoMdAddCircleOutline, IoMdRemoveCircleOutline } from "react-icons/io";
import { IoAddOutline, IoRemoveCircle, IoRemoveOutline } from 'react-icons/io5';
import { Dialog } from './Dialog';
import { set } from 'lodash';
import NewSession from './NewSession';
import { useAuth } from '@clerk/nextjs';




const DevicesList = ({type, devices}) => {
  const scrollRef = useRef(null);
  const {getToken} = useAuth();
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [dropDialog, setDropDialog] = useState(null);
  const [newSessionDialog, setNewSessionDialog] = useState(null);
  const router = useRouter();
  const socket = useSocket()
  const nameInputRef = useRef(null);
  const {editingId, setEditingId, setDeviceName} = useDevicesStore()
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

      const handleKeyDown = (e) => {
        if (editingId && e.key === "Escape") setEditingId(null);
      };

      

      container.addEventListener("wheel", handleWheel);  
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        container.removeEventListener("wheel", handleWheel);
        window.removeEventListener("keydown", handleKeyDown)
      }
    }, [editingId]);

  const saveEditedName = (userDeviceLinkId) => {
        const newName = nameInputRef.current.value;
        if (newName.trim() !== "") {
          console.log("Saving new name:", newName);
          apiClient.put(`/devices/${userDeviceLinkId}/name`, { name: newName })
          setDeviceName(userDeviceLinkId, newName, type);
          setEditingId(null);
        } else {
          toast("Name cannot be empty", {
            variant: "destructive"});
        }
      }

  const scroll = (direction) => {
    const scrollAmount = 370;
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleCardClick = (deviceId, event) => {
    router.push(`/device/${deviceId}/device-profile`);
  };

  const handleConnect = (deviceId) => {
    console.log("Connecting to device:", deviceId);
    socket.emit("initiate-webrtc", {
      deviceId
    });
  };

  const handleDropAllSessions = (deviceId) => {
  }

  const handleMyActivity = (deviceId) => {
  }

  const handleDeleteDevice = async (deviceId) => {
    const clerk_token = await getToken();
    const authHeaders = {
      headers: {
        Authorization: `Bearer ${clerk_token}`,
      },
    };
    try {
      await apiClient.delete(`/devices/${deviceId}`, authHeaders);
      toast("Device deleted successfully", {
        variant: "success"
      });
      setDeleteDialog(null);
      if (type === "myDevices") {
        useDevicesStore.getState().removeMyDevice(deviceId);
      } else {
        useDevicesStore.getState().removeOtherDevice(deviceId);
      }
    } catch (error) {
      console.error("Error deleting device:", error);
      toast("Failed to delete device", {
        variant: "destructive"
      });
    }
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
            <div key={device.deviceId} className="bg-dark-3 flex-col p-3 rounded-xl border-dark-4 border-[1px] hover:scale-105 transition-all duration-200" onClick={(e) => handleCardClick(device.deviceId, e)}>
              <div className="flex justify-between items-center gap-25">
                <div className="flex gap-2 items-center">
                    {console.log("Device OS:", device.os)}
                  {device.os?.toLowerCase().includes("ubuntu") ?
                    <FaUbuntu className="w-6 h-6" /> : <FaWindows className="w-6 h-6" />}
                  {editingId === device.deviceId ? 
                  (<input ref={nameInputRef} defaultValue={device.name} onBlur={(e) => {setEditingId(null)}}
                  placeholder='Enter device name'
                  className="w-full px-2 py-1 text-white bg-zinc-900 placeholder-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-dark-5"
                   autoFocus  onKeyDown={(e) => {e.key === "Enter" && saveEditedName(device._id)}} onClick={(e) => e.stopPropagation()}/>) : ( <>
                  <p className="font-semi-bold text-lg text-ellipsis w-[150px] whitespace-nowrap overflow-hidden">{device.name}</p>
                  <div className='cursor-pointer p-1' onClick={(e) => {
                    e.stopPropagation();
                    setEditingId(device.deviceId);
                    setTimeout(() => {
                      nameInputRef.current?.select();
                    }, 0);
                    }}>
                    <MdModeEdit className="opacity-40 hover:scale-[1.15] hover:opacity-100 active:scale-95 transition-all duration-300"  
                  />
                  </div>
                  </>
                  )}
                </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <FiMoreVertical className="cursor-pointer w-5 h-5 opacity-40 hover:scale-[1.15] hover:opacity-100 active:scale-90 transition-all duration-300"  onClick={(e) => {e.stopPropagation()}}/>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-dark-3 border-dark-4 text-white shadow-none outline-none ring-0"  onClick={(e) => {e.stopPropagation()}}>
                      <DropdownMenuLabel className="font-semibold weight-medium">
                        Actions
                      </DropdownMenuLabel>  
                      <DropdownMenuSeparator className="bg-gray-600 h-[1px]" />

                      {type === "myDevices" && <DropdownMenuItem className="hover:bg-dark-5 focus:bg-dark-5" onClick={(e) => setNewSessionDialog(device.deviceId)}>
                        <div className='flex gap-2 items-center justify-start'>
                          <IoMdAddCircle/>
                          <span>New Session</span>
                        </div>
                      </DropdownMenuItem>}

                      <DropdownMenuItem className="hover:bg-dark-5 focus:bg-dark-5" onClick={(e) => {
                        setEditingId(device.deviceId);
                        setTimeout(() => {
                          nameInputRef.current?.select();
                        }, 0);
                      }}>
                        <div className='flex gap-2 items-center justify-start'>
                          <MdModeEdit/>
                          <span>Rename</span>
                        </div>
                      </DropdownMenuItem>

                      <DropdownMenuItem className="hover:bg-dark-5 focus:bg-dark-5" onClick={(e) => {router.push(`/console/activity?deviceId=${device.deviceId}`)}}>
                        <div className='flex gap-2 items-center justify-start'>
                          <MdHistory />
                          <span>My Activity</span>
                        </div>
                      </DropdownMenuItem>
                      
                      {/* {type === "myDevices" && <DropdownMenuSeparator className="bg-gray-600" />} */}
                      
                      {type === "myDevices" && <DropdownMenuItem className="hover:bg-dark-5 focus:bg-dark-5" onClick={(e) => setDropDialog(device.deviceId)}>
                        <div className='flex gap-2 items-center justify-start'>
                          <IoRemoveCircle />

                          <span>Drop All Sessions</span>
                        </div>
                      </DropdownMenuItem>}

                      <DropdownMenuItem className="hover:bg-dark-5 focus:bg-dark-5" onClick={(e) => setDeleteDialog(device.deviceId)}>
                        <div className='flex gap-2 items-center justify-start' >
                          <MdDelete />
                          <span>Delete</span>
                        </div>
                      </DropdownMenuItem>

                    </DropdownMenuContent>
                  </DropdownMenu>
              </div>
              <div className="flex gap-1 items-center justify-start pl-8">
                <div className={`w-2 h-2 rounded-full ${statusColors[device.status]}`} />
                {console.log("Device Status:", device.status)}
                <p className="text-sm text-gray-400">{device.status}</p>
              </div>
              <div className="flex flex-col pt-4 gap-1">
                <p className="text-sm text-gray-400">{device.accessLevel}</p>
                <p className="text-sm text-gray-400">{`IP ${device.ip}`}</p>
                <p className="text-sm text-gray-400">{`${device.os}`}</p>
                <div className="flex gap-1 items-center justify-start">
                  <CiGlobe className="w-4 h-4"/>
                  <p className="text-sm text-gray-400">{device.location}</p>
                </div>
              </div>
              <div className="flex justify-between items-center mt-23">
                <div className="flex gap-2">
                  {device.connected ? 
                  <Button className="bg-primary-red hover:bg-primary-red-hover font-semibold active:scale-90 transition-all duration-100"
                  onClick={(e) => e.stopPropagation()}>Disconnect</Button>
                  : <Button className="bg-blue-500 hover:bg-blue-600 font-semibold active:scale-90 transition-all duration-100"
                  onClick={(e) => {e.stopPropagation(); handleConnect(device.deviceId)}}>Connect</Button>
                  }
                  <Button className="bg-dark-5/70 hover:bg-dark-5/100 active:scale-90 transition-all duration-100"
                   onClick={(e) => e.stopPropagation()}>Manage</Button>
                </div>
                <div className='p-1' onClick={(e) => {e.stopPropagation(); setDeleteDialog(device.deviceId)}} >
                    <MdDelete  className="h-5 w-5 hover:text-red-500 hover:scale-[1.25] active:scale-90 transition-all duration-100"/>
                </div>
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

      {deleteDialog &&
      <Dialog onClose={() => setDeleteDialog(null)}>
          <h2 className="text-lg font-bold mb-2">Delete Device</h2>
          <p className='text-sm'>Are you sure you want to delete this device?</p>
          <div className="flex justify-end mt-4">
            <Button className="mr-2 font-bold bg-dark-5 hover:bg-dark-4" onClick={() => setDeleteDialog(null)}>Cancel</Button>
            <Button className="bg-primary-red hover:bg-primary-red-hover font-bold" onClick={() => handleDeleteDevice(deleteDialog)}>Delete</Button>
          </div>
      </Dialog>
      }

      {dropDialog &&
      <Dialog onClose={() => setDropDialog(null)}>
          <h2 className="text-lg font-bold mb-2">Drop All Sessions</h2>
          <p className='text-sm'>Are you sure you want to drop all sessions for this device?</p>
          <div className="flex justify-end mt-4">
            <Button className="mr-2 font-bold  bg-dark-5 hover:bg-dark-4" onClick={() => setDropDialog(null)}>Cancel</Button>
            <Button className="bg-primary-red hover:bg-primary-red-hover font-bold" onClick={() => handleDropAllSessions(dropDialog)}>Drop</Button>
          </div>
      </Dialog>
      }

      {newSessionDialog &&
      <Dialog onClose={() => setNewSessionDialog(null)}>
          <NewSession deviceId={newSessionDialog} type={type}/>
      </Dialog>}
    </>
  )
}

export default DevicesList
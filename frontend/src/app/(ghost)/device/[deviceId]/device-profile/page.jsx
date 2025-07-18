"use client"
import { useParams, useRouter} from "next/navigation";
import React, { useCallback, useEffect, useState } from 'react';
import { FaWindows, FaUbuntu } from "react-icons/fa";
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@clerk/nextjs";
import { useDeviceProfileStore } from "@/store/slices/ActiveConnection/DeviceProfileSlice";
import { apiClient } from "@/lib/apiClient";
import { permissionDesriptions } from "@/utils/constants";
import { toast } from "sonner";
import { set } from "lodash";


const DeviceProfilePage = () => {
  const { deviceId } = useParams();
  const {deviceInfo, permissions} = useDeviceProfileStore();
  const { getToken } = useAuth();
  const {router} = useRouter();
  const [sessionsData, setSessionsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deviceId) {
      router.push("/console");
      console.error("Device ID is not available.");
      return;
    }

    async function fetchSessionData() {
      try {
        const clerk_token = await getToken();
        const authHeaders = {
          headers: {
            Authorization: `Bearer ${clerk_token}`,
          },
        };
        const response = await apiClient.get(`/sessions/connected-sessions/${deviceId}`, authHeaders);
        setSessionsData(response.data);
        console.log("Connected Sessions Data:", response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching session data:", error);
      }
    }
    fetchSessionData();
  }, [deviceId, getToken]);

  const handleKillSession = async (sessionKey) => {
    try {
      const clerk_token = await getToken();
      const authHeaders = {
        headers: {
          Authorization: `Bearer ${clerk_token}`,
        },
      };
      const response = await apiClient.delete(`/sessions/${sessionKey}`, authHeaders);
      console.log("Session terminated successfully:", response.data);
      setSessionsData((prevSessions) => prevSessions.map(session => {
        if (session.sessionKey === sessionKey) {
          return { ...session, status: 'terminated' };
        } else {
          return session;
        }
      }));
    } catch (error) {
      console.error("Error terminating session:", error);
      toast.error("Failed to terminate session. Please try again.");
    }
  };

  const handleCheckBox = (checked, sessionIndex, permissionIndex) => {
    if (sessionsData[sessionIndex].status !== 'active') {
      console.log(1)
      return;
    }
    const devicePermissions = permissions.map((permission) => {
      const key = permission.key;
      const value = permission.value.allowed;
      return { [key]: value };
    })
    let sessionPermissions = sessionsData[sessionIndex].permissions;
    const permissionKey = Object.keys(sessionPermissions[permissionIndex])[0];
    const permissionValue = sessionPermissions[permissionIndex][permissionKey];
    // what ever the case is if the particular permission is unchecked in device permissions it should be always unchecked in session permissions and dont change the device permissions at all
    // if remote control is checked in session permissions check everything if remotecontrol is unchecked in session permissions uncheck everything
    // when remotecontrol is allowed and some other option is unchecked in session permissions the that option and remote control both should be unchecked in session permissions
    // do all these changes in session permissions and set the sessiondata while only changeing sessionPermissions and kepping everything else same
    if (!devicePermissions[permissionIndex][permissionKey]) {
      return;
    }

    if (permissionKey === 'remoteControl') {
      sessionPermissions = sessionPermissions.map((perm, i) => {
        console.log(perm)
        const key = Object.keys(perm)[0];
        console.log(key)
        return {[key]: checked}
      })
    } else if (sessionPermissions[0]["remoteControl"] && !checked) {
      sessionPermissions = sessionPermissions.map((perm, i) => {
        const key = Object.keys(perm)[0];
        if (i === permissionIndex || key === 'remoteControl') {
          return {[key]: false};
        } else {
          return {[key]: perm[key]};
        }
      });
    } else {
      sessionPermissions[permissionIndex] = {
        [permissionKey]: checked
      };
    }

    setSessionsData((prevSessions) => {
      return (prevSessions.map((session, index) => {
        if (index === sessionIndex) {
          return {
            ...session, permissions: sessionPermissions}
        } else {
          return session;
        }
      }))
    });
  }

  const savePermissions = async (sessionIndex) => {
    const session = sessionsData[sessionIndex];
    const sessionPermissions = session.permissions;
    const sessionKey = session.sessionKey;

    try {
      const clerk_token = await getToken();
      const authHeaders = {
        headers: {
          Authorization: `Bearer ${clerk_token}`,
        },
      };
      const response = await apiClient.put(`/sessions/update-permissions`, { sessionKey ,permissions: sessionPermissions }, authHeaders);
      console.log("Permissions updated successfully:", response.data);
      toast.success("Permissions updated successfully.");
    } catch (error) {
      console.error("Error updating permissions:", error);
      toast.error("Failed to update permissions. Please try again.");
    }
  }

  const redable_time = useCallback((time) => {
    const date = new Date(time);
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('en-US', options);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100vh] p-4 pb-0 pr-0">
      <div className="text-white text-3xl font-bold mb-2">
        Device Profile
      </div>


      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Info about device */}
        <div className="flex flex-col bg-dark-3 p-1 rounded-xl">
          <div className="flex m-4 pb-2 items-center border-b border-[#ffffff1a] gap-2">
            <FaWindows className="text-4xl text-blue-500 mr-2" />
            <div className="flex justify-center flex-col">
              <h2 className="font-semibold text-xl">{deviceInfo?.name}</h2>
              <p className="text-gray-500 text-sm">{deviceInfo?.os}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 p-4 gap-5">

              <div className="flex flex-col justify-end items-start gap-1">
                <span className="text-gray-400/80 text-md 2xl:text-sm">OS</span>
                <span className="font-sans text-md 2xl:text-md">{deviceInfo?.os}</span>
              </div>

              <div className="flex flex-col justify-end items-start gap-1">
                <span className="text-gray-400/80 text-md 2xl:text-sm">IP</span>
                <span className="font-sans text-md 2xl:text-md">{deviceInfo?.ip}</span>
              </div>

              <div className="flex flex-col justify-end items-start gap-1">
                <span className="text-gray-400/80 text-md 2xl:text-sm">Location</span>
                <span className="font-sans text-md 2xl:text-md">{deviceInfo?.location}</span>
              </div>

              <div className="flex flex-col justify-end items-start gap-1">
                <span className="text-gray-400/80 text-md 2xl:text-sm">CPU</span>
                <span className="font-sans text-md 2xl:text-md">{deviceInfo?.cpu}</span>
              </div>

              <div className="flex flex-col justify-end items-start gap-1">
                <span className="text-gray-400/80 text-md 2xl:text-sm">Username</span>
                <span className="font-sans text-md 2xl:text-md">{deviceInfo?.username}</span>
              </div>

              <div className="flex flex-col justify-end items-start gap-1">
                <span className="text-gray-400/80 text-md 2xl:text-sm">Hostname</span>
                <span className="font-sans text-md 2xl:text-md">{deviceInfo?.hostname}</span>
              </div>

              <div className="flex flex-col justify-end items-start gap-1">
                <span className="text-gray-400/80 text-md 2xl:text-sm">Architecture</span>
                <span className="font-sans text-md 2xl:text-md">{deviceInfo?.architecture}</span>
              </div>

              <div className="flex flex-col justify-end items-start gap-1">
                <span className="text-gray-400/80 text-md 2xl:text-sm">Role</span>
                <span className="font-sans text-md 2xl:text-md">{deviceInfo?.role}</span>
              </div>

              <div className="flex flex-col justify-end items-start gap-1">
                <span className="text-gray-400/80 text-md 2xl:text-sm">Last Updated</span>
                <span className="font-sans text-md 2xl:text-md">{redable_time(deviceInfo?.updatedAt)}</span>
              </div>

          </div>
        </div>

        {/* Permissions and Actions */}
        <div className="flex flex-col bg-dark-3 p-1 mt-4 rounded-xl">
          <h2 className="text-xl font-bold m-4 pb-2 border-[#ffffff1a] border-b">Allowed Actions on This System</h2>
          <div className="p-3 text-gray-500">You currently have the following permissions granted on this device.<br/>
          These permissions define the level of access and control available to you while interacting with this system.<br/>
          If you require additional capabilities request the permissions or modify them directly from the device by an authorized administrator.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2">
            
            <div className="flex flex-col justify-start gap-3 p-3">
              {permissions?.filter((permission) => permission.value.allowed).map((permission) => (
                <Label key={permission.key} className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 dark:has-[[aria-checked=true]]:border-purple-1/50 dark:has-[[aria-checked=true]]:bg-purple-1/20">
                  <Checkbox
                    id="toggle-2"
                    defaultChecked
                    disabled
                    className="data-[state=checked]:border-purple-1/50 border-white/50 data-[state=checked]:bg-purple-1 data-[state=checked]:text-white "
                  />
                  <div className="grid gap-1.5 font-normal">
                    <p className="text-sm leading-none font-medium">
                      {permission.value.shortDescription}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {permission.value.longDescription}
                    </p>
                  </div>
                </Label>
              ))}
              {permissions?.filter((permission) => !permission.value.allowed).map((permission) => (
                <div key={permission.key} className="flex items-start gap-3 pl-4">
                  <Checkbox id="terms-2" disabled className="bg-dark-5"/>
                  <div className="grid gap-2">
                    <Label htmlFor="terms-2">{permission.value.shortDescription}</Label>
                    <p className="text-muted-foreground text-sm">
                      {permission.value.longDescription}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
        
        {/* Other users with access */}
        { sessionsData.length > 0 &&
        <div className="flex flex-col bg-dark-3 p-1 mt-4 rounded-xl">
            <h2 className="text-xl font-bold m-4 pb-2 border-[#ffffff1a] border-b">Other users with Ascess</h2>
            <div className="overflow-y-auto custom-scrollbar max-h-210">
                {sessionsData.map((session, sessionIndex) => (
              <div className="flex flex-col justify-center bg-dark-4/70 p-4 pb-5 rounded-xl ml-4 mb-3" key={session.sessionKey}>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col justify-center pb-6">
                    <div className="flex items-center justify-center gap-2">
                      <p className="text-xl font-bold pt-2">{session.joinedUserName}</p>
                      <Badge className={`${session.status === 'active'?
                         'bg-purple-1': 
                         (session.status === 'completed' ?
                          'bg-gray-500/50' :
                           "bg-primary-red")} text-white font-semibold mt-2`}>
                          {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">Access Granted: {session.accessedDate}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {session.status === 'active' && <Button className="bg-primary-red hover:scale-105 transition-all duration-300 cursor-pointer hover:bg-primary-red-hover font-semibold mb-5" onClick={() => handleKillSession(session.sessionKey)} variant={"ghost"}>Kill Session</Button>}
                    {/* <Button className="bg-primary-red hover:bg-primary-red-hover font-semibold">Remove Access</Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 font-semibold">Revoke Access</Button> */}
                  </div>
                </div>

                <div className="flex flex-col gap-5">
                  <p className="font-semibold text-lg">Permissions</p>
                    <div className="flex">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {session.permissions?.map((permission, permissionIndex) => {
                          const [key, value] = Object.entries(permission)[0];
                          return (
                            <div className="flex items-center gap-3" key={key}>
                              <Checkbox checked={value} disabled={!permissions[permissionIndex].value.allowed || session.status !== 'active'}
                               onCheckedChange={(checked) => handleCheckBox(checked, sessionIndex, permissionIndex)} className="data-[state=checked]:bg-purple-1 data-[state=checked]:border-purple-1/50 border-white/50 border-[1px]"/>
                              <Label className="">{permissionDesriptions[key].shortDescription}</Label>
                            </div>
                        )})}
                      </div>
                      {session.status === 'active' &&
                        <Button className="flex-none self-end bg-purple-1 font-semibold hover:scale-105 transition-all duration-300 cursor-pointer"
                        onClick={() => savePermissions(sessionIndex)}
                        >Save</Button>}
                    </div>
                  
                </div>
              </div>
              ))}
              { 
              deviceInfo.linkRole === "owner" && sessionsData.length === 0 &&
                <p className="p-4 text-gray-500">No other user has ascess to this device.</p>
              }
            </div>
        </div>}
      </div>
    </div>
  )
}

export default DeviceProfilePage
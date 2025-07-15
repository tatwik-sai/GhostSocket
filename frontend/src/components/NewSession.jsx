"use client"
import React, { useEffect, useState } from 'react';
import { Fragment } from 'react';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react';
import { ChevronDown, Check, Copy } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { useDevicesStore } from '@/store/slices/DevicesSlice';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@clerk/clerk-react';
import { toast } from 'sonner';

const NewSession = ({deviceId}) => {
  const { getToken } = useAuth();
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expiryOption, setExpiryOption] = useState('manual');
  const [customExpiryDateTime, setCustomExpiryDateTime] = useState('');

  const expiryOptions = [
    { value: '15min', label: '15 Minutes' },
    { value: '30min', label: '30 Minutes' },
    { value: '1hr', label: '1 Hour' },
    { value: 'custom', label: 'Custom Expiry' },
    { value: 'manual', label: 'Manually Delete' }
  ];

  const [permissions, setPermissions] = useState([]);

  const [sessionKey, setSessionKey] = useState('');
  const [showSessionKey, setShowSessionKey] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const clerk_token = await getToken();
        const response = await apiClient.get(`/devices/${deviceId}`, {
          headers: { Authorization: `Bearer ${clerk_token}` }
        });
        console.log("Device:", response.data);
        setDevice(response.data);
        setPermissions(response.data.permissions)
      } catch (error) {
        console.error("Error fetching device:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (deviceId) {
      fetchData();
    }
  }, [deviceId, getToken]);

  // Handle change for expiry dropdown
  const handleExpiryChange = (value) => { // Updated for Listbox
    setExpiryOption(value);
    if (value !== 'custom') {
      setCustomExpiryDateTime('');
    }
  };

  const handleCustomExpiryDateTimeChange = (event) => {
    setCustomExpiryDateTime(event.target.value);
  };

  const handlePermissionChange = (checked, index) => {
    if (permissions[index].key === "remoteControl") {
        setPermissions((prevPermissions) => 
        prevPermissions.map((permission, i) => {
            return {
            ...permission,
            value: {
                ...permission.value,
                allowed: !device?.permissions[i].value.allowed ? false : checked
            }
            };
        })
        );
        return;
    }
    const isRCEnabled = permissions[0].key === "remoteControl" && permissions[0].value.allowed;
    let uncheckRC = false
    if (isRCEnabled && !checked) {
        uncheckRC = true;
    }
    setPermissions((prevPermissions) => 
        prevPermissions.map((permission, i) => {
        if (i === index) {
            return {
            ...permission,
            value: {
                ...permission.value,
                allowed: checked
            }
            };
        } else if (uncheckRC && permission.key === "remoteControl") {
            return {
                ...permission,
                value: {
                    ...permission.value,
                    allowed: false
                }
            };
        }
        return permission;
        })
    );
    };

  const generateSessionKey = async () => {
    if (expiryOption === 'custom') {
        if (!customExpiryDateTime) {
            toast.error('Please select a custom expiry date and time.');
        return;
        }
        
        const selectedDate = new Date(customExpiryDateTime);
        const currentDate = new Date();
        const tenMinutesFromNow = new Date(currentDate.getTime() + 10 * 60 * 1000);
        
        if (selectedDate < tenMinutesFromNow) {
        toast.error(`Expiry must be at least 10 minutes from now.`);
        return;
        }
        
        const oneYearFromNow = new Date(currentDate.getTime() + 365 * 24 * 60 * 60 * 1000);
        if (selectedDate > oneYearFromNow) {
            toast.error('Expiry time cannot be more than 1 year from now.');
        return;
        }
    }
    
    // generate a date time object based on expiryOption
    let expiryDateTime; 
    switch (expiryOption) {
      case '15min':
        expiryDateTime = new Date(Date.now() + 15 * 60 * 1000);
        break;
      case '30min':
        expiryDateTime = new Date(Date.now() + 30 * 60 * 1000);
        break;
      case '1hr':
        expiryDateTime = new Date(Date.now() + 60 * 60 * 1000);
        break;
      case 'custom':
        expiryDateTime = new Date(customExpiryDateTime);
        break;
      case 'manual':
        expiryDateTime = null;
        break;
    }

    const clerk_token = await getToken();
    const authHeaders = {
        headers: {
            Authorization: `Bearer ${clerk_token}`,
        },
    };
    const response = await apiClient.post("/sessions/create", {
        deviceId: deviceId,
        expiry: expiryDateTime,
        permissions: permissions.map(p => ({ [p.key]: p.value.allowed }))
    }, authHeaders);

    setSessionKey(response.data.sessionKey.toUpperCase());
    setShowSessionKey(true);
};

  const copySessionKey = () => {
    const el = document.createElement('textarea');
    el.value = sessionKey;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    alert('Session ID copied to clipboard!');
    console.log("Copied Session Key:", sessionKey);
  };

  // Add loading state
  if (loading) {
    return (
      <div className="text-gray-100 p-2 flex items-center justify-center">
        <div className="w-full rounded-2xl shadow-lg p-4">
          <p>Loading device...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-gray-100 p-2 flex items-center justify-center">
      <div className="w-full rounded-2xl shadow-lg">
        <h1 className="text-lg font-bold mb-5">
          New Session - {device?.deviceInfo?.name}
        </h1>

        {/* Expiry Section */}
        <div className="mb-5">
          <label className="block text-gray-300 text-xs font-medium mb-1">
            Expiry Time
          </label>
          <Listbox value={expiryOption} onChange={handleExpiryChange}>
            <div className="relative w-[80%]">
              <ListboxButton className="relative w-full p-2 border border-gray-600 rounded-md bg-dark-5 text-gray-100 outline-none ring-0 text-md text-left">
                <span className="block truncate">
                  {expiryOptions.find(option => option.value === expiryOption)?.label}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </span>
              </ListboxButton>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <ListboxOptions className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md outline-none bg-dark-5 shadow-lg z-50">
                  {expiryOptions.map((option) => (
                    <ListboxOption
                      key={option.value}
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-1 px-4 ${
                          active ? 'bg-dark-4 text-gray-100' : 'text-gray-300'
                        } first:rounded-t-md last:rounded-b-md`
                      }
                      value={option.value}
                    >
                      {({ selected }) => (
                        <>
                          <span className='text-md'>
                            {option.label}
                          </span>
                          {selected ? (
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-600">
                              <Check className="h-4 w-4 text-white/60" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </ListboxOption>
                  ))}
                </ListboxOptions>
              </Transition>
            </div>
          </Listbox>
        </div>

        {/* Custom Expiry Input */}
        {expiryOption === 'custom' && (
          <div className="mb-5 space-y-2">
            <label htmlFor="custom-expiry" className="block text-gray-300 text-xs font-medium">
              Custom Expiry Date & Time
            </label>
            <div className="relative w-[80%]">
              <input
                type="datetime-local"
                id="custom-expiry"
                className="w-full p-2 rounded-md bg-dark-5 border border-gray-600 text-gray-100 focus:outline-none ring-0 [color-scheme:dark]"
                value={customExpiryDateTime}
                onChange={handleCustomExpiryDateTimeChange}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          </div>
        )}

        {/* Permissions Section */}
        <div className="mb-4">
          <h2 className="text-xs font-medium text-gray-300 mb-3">Permissions:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {permissions.map((permission, index) => {
                const [key, value] = [permission.key, permission.value];
                return (
              <div key={key} className="flex items-center">
                <Checkbox
                  id={key}
                  checked={value.allowed}
                  disabled={!device?.permissions[index].value.allowed}
                  onCheckedChange={(checked) => handlePermissionChange(checked, index)}
                  className="h-4 w-4 text-white bg-dark-5 data-[state=checked]:bg-blue-600 rounded-sm border-gray-600 outline-none ring-0"
                />
                <label htmlFor={key} className="ml-3 text-gray-200 text-md capitalize">
                  {value.shortDescription === "Remote Control Access"? "Remote Control": value.shortDescription}
                </label>
              </div>
            )})}
          </div>
        </div>

        {/* Generate Session Key Button */}
        <button
          onClick={generateSessionKey}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-1 rounded-md transition-all duration-300 shadow-md hover:shadow-lg text-md"
        >
          Generate Session Key
        </button>

        {/* Session Key Display Area */}
        {showSessionKey && (
          <div className="mt-5 p-4 bg-dark-5 rounded-md shadow-inner">
            <h3 className="text-md font-bold mb-3">Your Unique Session ID</h3>
            <div className="flex items-center bg-dark-4 rounded-md p-3 mb-1">
              <p className="flex-grow text-gray-100 font-mono text-sm mr-4 whitespace-nowrap overflow-hidden text-ellipsis">{sessionKey}</p>
              <Copy className='h-5 opacity-70 hover:opacity-100 hover:scale-115 transition-all duration-200 active:scale-100 cursor-pointer' onClick={copySessionKey}/>
            </div>
            <div className="flex items-center text-xs text-gray-400 space-x-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Copy this ID now it will only appear once</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewSession;
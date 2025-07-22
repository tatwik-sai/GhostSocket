'use client'
import React, { useEffect, useState } from 'react'
import { Clock, CheckCircle, XCircle, Users, Check, Timer } from 'lucide-react'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react';
import { IoFilterOutline, IoSearch } from "react-icons/io5";
import { Fragment } from 'react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@clerk/clerk-react';
import { permissionDesriptions } from '@/utils/constants';
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

const SessionsPage = () => {
  const [sessionKey, setSessionKey] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sessionOption, setSessionOption] = useState('all');
  const { getToken } = useAuth();
  const [sessionsData, setSessionsData] = useState([]);
  const [ showDetailsId, setShowDetailsId ] = useState(null);
  
  const sessionOptions = [
    { value: 'all', label: 'All' },
    { value: 'joined', label: 'Joined' },
    { value: 'created', label: 'Created' },
    { value: 'expired', label: 'Expired' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'terminated', label: 'Terminated' },
    { value: 'pending', label: 'Pending'}
  ];

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const clerk_token = await getToken();
        const authHeaders = {
          headers: {
            Authorization: `Bearer ${clerk_token}`,
          },
        };
        const response = await apiClient.get('sessions/get-sessions', authHeaders);
        if (response.status === 200) {
          setSessionsData(response.data);
        } else {
          toast.error(response.data?.message || 'Failed to fetch sessions', {
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Fetch sessions error:', error);
        if (error.response) {
          const message = error.response.data?.message || 'Failed to fetch sessions';
          toast.error(message, {
            variant: "destructive",
          });
        } else if (error.request) {
          toast.error('Network error. Please check your connection.', {
            variant: "destructive",
          });
        } else {
          toast.error('An unexpected error occurred', {
            variant: "destructive",
          });
        }
      }
    };
    fetchSessions();
  }, [getToken]);

  const formatSessionKey = (value) => {
    const cleanValue = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const groups = cleanValue.match(/.{1,4}/g) || [];
    return groups.join('-');
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    const formattedValue = formatSessionKey(inputValue);
    if (formattedValue.replace(/-/g, '').length <= 24) {
      setSessionKey(formattedValue);
    }
  };

  const handleJoinSession = async () => {
    if (!sessionKey.trim()) {
      toast.error('Please enter a session ID', {
        variant: "destructive", // Note: it's "variant", not "variants"
      });
      return;
    }
    
    try {
      const sessionKeyFormatted = sessionKey.replace(/-/g, '').toLowerCase();
      const clerk_token = await getToken();
      const authHeaders = {
        headers: {
          Authorization: `Bearer ${clerk_token}`,
        },
      };
      
      const response = await apiClient.post('/sessions/join', { sessionKey: sessionKeyFormatted }, authHeaders);
      
      if (response.status === 200) {
        toast.success('Joined the session successfully');
        setSessionKey('');
      } else {
        toast.error(response.data?.message || 'Failed to join the session', {
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Join session error:', error);
      
      // Handle different error types
      if (error.response) {
        // Server responded with error status
        const message = error.response.data?.message || 'Failed to join the session';
        toast.error(message, {
          variant: "destructive",
        });
      } else if (error.request) {
        // Network error
        toast.error('Network error. Please check your connection.', {
          variant: "destructive",
        });
      } else {
        // Other error
        toast.error('An unexpected error occurred', {
          variant: "destructive",
        });
      }
    }
  };


  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return (
          <div className="w-4 h-4 flex items-center justify-center">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
          </div>
        );
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'expired':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'terminated':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Timer className="w-4 h-4 text-purple-500" />;
      default:
        return <div className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/10';
      case 'completed': return 'text-green-400 bg-green-500/10';
      case 'expired': return 'text-yellow-400 bg-yellow-500/10';
      case 'terminated': return 'text-red-400 bg-red-500/10';
      case 'pending': return 'text-purple-400 bg-purple-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const handleSessionOptionChange = (value) => {
    setSessionOption(value);
  };

  const filteredSessions = sessionsData.filter(session => {
    const matchesSearch = searchTerm === '' || 
      session.sessionKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.deviceName.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (sessionOption !== 'all') {
      if (sessionOption === 'joined' || sessionOption === 'created') {
        matchesFilter = session.type === sessionOption;
      } else {
        matchesFilter = session.status === sessionOption;
      }
    }
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen text-white p-7 pb-1 pr-2">
      <div className=" mx-auto custom-scrollbar auto-scroll-y">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-2xl font-bold mb-0">Sessions</h1>
        </div>

        {/* Join Session Section */}
        <div className="bg-dark-3 rounded-lg p-4 mb-4">
          <div className="flex gap-4 max-w-2xl">
            <input
              type="text"
              placeholder="Enter your session key(XXXX-XXXX-XXXX-XXXX-XXXX-XXXX)"
              value={sessionKey}
              onChange={handleInputChange}
              className="flex-1 bg-dark-4 border border-dark-5 ring-0 focus:outline-none rounded-lg px-2 py-2 text-white text-sm placeholder-gray-400 font-mono tracking-wide"
            />
            <button
              onClick={handleJoinSession}
              className="purple-primary-button rounded-md px-4 text-sm text-white font-semibold"
            >
              Join Session
            </button>
          </div>
        </div>

        {/* Sessions */}
        <div className="bg-dark-3 rounded-lg p-4">
          <div className='flex justify-between pb-4'>
            <div className='flex items-center gap-4'>
              <h2 className="text-xl font-semibold">Previous Sessions ({filteredSessions.length})</h2>

              {/* Filter  */}
              <Listbox value={sessionOption} onChange={handleSessionOptionChange}>
                <div className="relative">
                  <ListboxButton className="relative w-full min-w-26 p-0.5 border border-dark-5 rounded-md bg-dark-4 text-gray-100 outline-none ring-0 text-left">
                    <div className="flex items-center">
                      <IoFilterOutline className="w-4 h-4 text-gray-400 mr-2" />
                      <p className='text-sm opacity-60'>
                        {sessionOptions.find(option => option.value === sessionOption)?.label}
                      </p>
                    </div>
                  </ListboxButton>
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <ListboxOptions className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md outline-none bg-dark-5 shadow-lg z-50">
                      {sessionOptions.map((option) => (
                        <ListboxOption
                          key={option.value}
                          className={({ active }) =>
                            `relative cursor-pointer select-none py-0.5 px-4 ${
                              active ? 'bg-dark-4 text-gray-100' : 'text-gray-300'
                            } first:rounded-t-md last:rounded-b-md`
                          }
                          value={option.value}
                        >
                          {({ selected }) => (
                            <>
                              <span className='text-sm'>
                                {option.label}
                              </span>
                              {selected ? (
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                                  <Check className="h-4 w-4" aria-hidden="true" />
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
            {/* Search Bar */}
            <div className="relative w-70">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}  
                className="bg-dark-4 h-10 p-2 w-full text-sm focus:outline-none pl-9 rounded-lg focus:ring-2 focus:ring-white/30"
              />
              <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                <IoSearch className="h-5 w-5" />
              </span>
            </div>
          </div>
          
          <div className='overflow-y-auto max-h-[calc(100vh-260px)] custom-scrollbar'>
            {filteredSessions.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No sessions found matching your criteria</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSessions.map((session) => (
                  <div key={session.sessionKey} className="bg-dark-4/70 rounded-lg p-4 hover:bg-gray-650 transition-colors duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono text-sm bg-dark-5 px-3 py-1 rounded">
                            {session.sessionKey}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(session.status)}`}>
                            <div className="flex items-center justify-center gap-1 min-h-[16px]">
                              {getStatusIcon(session.status)}
                              {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                            </div>
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${session.type === 'created' ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-500/10 text-blue-400'}`}>
                            {session.type === 'created' ? 'Created' : 'Joined'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-300">
                          <div>
                            <span className="text-gray-400">Device</span>
                            <p className="font-bold">{session.deviceName}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">{session.joinedUserName ? "Joined By": "Created By"}</span>
                            <p className="font-bold">{session.joinedUserName ? session.joinedUserName : session.createdUserName}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Created</span>
                            <p className="font-bold">{session.createdAt}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Expiry</span>
                            <p className="font-bold">{session.expiry}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <button className="bg-white/20 hover:bg-white/30 active:scale-95 transition-all duration-300
                         text-white px-4 py-2 rounded-md text-sm font-medium"
                         onClick={() => setShowDetailsId(showDetailsId === session.sessionKey ? null : session.sessionKey)}>
                          Details
                        </button>
                      </div>
                    </div>
                    {/* Permissions */}
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden transform ${
                      showDetailsId === session.sessionKey 
                        ? 'max-h-96 opacity-100 translate-y-0 pt-4' 
                        : 'max-h-0 opacity-0 -translate-y-2 pt-0'
                    }`}>
                      <div className="transition-all duration-300 ease-in-out">
                        <h2 className="text-md font-semibold text-gray-300 mb-3">Permissions:</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {session.permissions?.map((permission) => {  
                            const [key, value] = Object.entries(permission)[0];
                            return (
                              <div key={key} className="flex items-center gap-3">
                                <Checkbox checked={value} className="data-[state=checked]:bg-purple-1 data-[state=checked]:border-purple-1/90 border-white/50 border-[1px]"/>
                                <Label className="text-sm">{permissionDesriptions[key].shortDescription}</Label>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SessionsPage
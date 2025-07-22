"use client"
import { useResourcesStore } from '@/store/slices/ActiveConnection/ResourcesSlice';
import { useStreamsAndConnectionStore } from '@/store/slices/ActiveConnection/StreamsAndConnectionSlice';
import React, {useEffect} from 'react'
import { IoSearch } from 'react-icons/io5';

const ProcessMonitor = () => {
  const {processesList, setActiveTab} = useResourcesStore();
  const [searchQuery, setSearchQuery] = React.useState("");

  useEffect(() => {
    setActiveTab("process")
    const {tcpDataChannel} = useStreamsAndConnectionStore.getState();
    if (!tcpDataChannel) return;
    tcpDataChannel.send(JSON.stringify({type: "get_processes"}));
  }, [setActiveTab])
  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-2xl">Processes</h3>
        <div className="relative w-70 pl-1 py-1">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-dark-3 h-10 p-2 w-full text-sm focus:outline-none pl-9 rounded-lg focus:ring-2 focus:ring-white/30"
          />
          <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
            <IoSearch className="h-5 w-5" />
          </span>
        </div>
      </div>

      <div className="mt-2 border-t border-[#ffffff1a]">
        <div className="overflow-y-auto h-[calc(100vh-180px)] custom-scrollbar">
          <table className="table-auto w-full text-left">
            <thead className="sticky top-0 bg-dark-3 z-10 border-b-[2px] border-[#ffffff1a]">
              <tr>
                <th className="px-4 py-2 w-[10%]">PID</th>
                <th className="px-4 py-2 w-[40%]">Name</th>
                <th className="px-4 py-2 w-[30%]">User</th>
                <th className="px-4 py-2 w-[20%]">Status</th>
              </tr>
            </thead>
            <tbody>
              {processesList  
                .filter(proc => proc.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(proc => (
                  <tr key={proc.pid} className="border-b border-[#ffffff1a] hover:bg-[#171717] h-12">
                    <td className="px-4 py-2 w-[10%]">{proc.pid}</td>
                    <td className="px-4 py-2 w-[40%]">{proc.name}</td>
                    <td className="px-4 py-2 w-[30%]">{proc.user}</td>
                    <td className="px-4 py-2 w-[20%]">{proc.status}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

  )
}

export default ProcessMonitor
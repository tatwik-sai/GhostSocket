// src/components/SystemMonitorDashboard.jsx
'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';

// Shadcn UI components
import { Button } from '@/components/ui/button';
import { CpuMonitorSection } from './CpuMonitor';
import { MemoryMonitorSection } from './MemoryMonitor';
import { ProcessesMonitorSection } from './ProcessMonitor';


// --- Custom Hooks for Dummy Data Simulation (No changes needed here) ---

export const useCpuDataSimulation = () => {
  const [cpuUtilization, setCpuUtilization] = useState(0);
  const [cpuHistory, setCpuHistory] = useState([]);
  const cpuInfo = useRef({
    brand: "AMD Ryzen 7 6800HS with Radeon Graphics",
    speed: 3.20, // GHz
    baseSpeed: 3.20, // GHz
    maxSpeed: 4.70, // GHz
    cores: 8,
    logicalProcessors: 16,
    sockets: 1,
    virtualization: "Enabled",
    cache: { l1: 512, l2: 4096, l3: 16384 }
  });
  const processCount = useRef(266);
  const threadCount = useRef(4623);
  const handleCount = useRef(141530);
  const uptimeSeconds = useRef(Date.now() / 1000 - 800000);

  useEffect(() => {
    const interval = setInterval(() => {
      const newUtilization = Math.max(0, Math.min(100, Math.random() * 100 * (1 - Math.sin(Date.now() / 5000)) + 20));
      setCpuUtilization(parseFloat(newUtilization.toFixed(1)));
      setCpuHistory(prevHistory => {
        const newHistory = [...prevHistory, { date: Date.now(), utilization: newUtilization }];
        return newHistory.slice(-60);
      });
      processCount.current = Math.max(0, processCount.current + Math.floor(Math.random() * 3) - 1);
      threadCount.current = Math.max(0, threadCount.current + Math.floor(Math.random() * 10) - 5);
      handleCount.current = Math.max(0, handleCount.current + Math.floor(Math.random() * 50) - 25);
      uptimeSeconds.current += 1;
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (totalSeconds) => {
    const days = Math.floor(totalSeconds / (3600 * 24));
    totalSeconds %= (3600 * 24);
    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${days}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  };

  return {
    cpuUtilization, cpuHistory, cpuInfo: cpuInfo.current, processCount: processCount.current,
    threadCount: threadCount.current, handleCount: handleCount.current, uptime: formatUptime(uptimeSeconds.current),
  };
};

export const useMemoryDataSimulation = () => {
  const [memoryUtilization, setMemoryUtilization] = useState(0);
  const [memoryHistory, setMemoryHistory] = useState([]);
  const memoryInfo = useRef({ total: 16 * 1024 * 1024 * 1024, });

  useEffect(() => {
    const interval = setInterval(() => {
      const newUtilization = Math.max(0, Math.min(100, Math.random() * 100 * (1 - Math.cos(Date.now() / 7000)) + 30));
      setMemoryUtilization(parseFloat(newUtilization.toFixed(1)));
      setMemoryHistory(prevHistory => {
        const newHistory = [...prevHistory, { date: Date.now(), utilization: newUtilization }];
        return newHistory.slice(-60);
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const usedMemoryBytes = (memoryUtilization / 100) * memoryInfo.current.total;
  const availableMemoryBytes = memoryInfo.current.total - usedMemoryBytes;

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return {
    memoryUtilization, memoryHistory,
    totalMemory: formatBytes(memoryInfo.current.total),
    usedMemory: formatBytes(usedMemoryBytes),
    availableMemory: formatBytes(availableMemoryBytes),
  };
};

export const useProcessesDataSimulation = () => {
  const [processes, setProcesses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const dummyProcessNames = [
    "chrome.exe", "firefox.exe", "msedge.exe", "explorer.exe", "code.exe",
    "discord.exe", "spotify.exe", "steam.exe", "notepad.exe", "calc.exe",
    "svchost.exe", "csrss.exe", "winlogon.exe", "dwm.exe", "RuntimeBroker.exe",
    "cmd.exe", "powershell.exe", "python.exe", "node.exe", "nginx.exe"
  ];

  const generateDummyProcesses = useCallback(() => {
    const newProcesses = Array.from({ length: 50 + Math.floor(Math.random() * 50) }, (_, i) => {
      const name = dummyProcessNames[Math.floor(Math.random() * dummyProcessNames.length)];
      const pid = 1000 + i + Math.floor(Math.random() * 1000);
      const cpu = parseFloat((Math.random() * 10).toFixed(1));
      const memory = parseFloat((Math.random() * 500).toFixed(1));
      const user = Math.random() > 0.7 ? "SYSTEM" : "user";
      return { id: pid, name, pid, cpu, memory, user };
    });
    setProcesses(newProcesses);
  }, []);

  useEffect(() => {
    generateDummyProcesses();
    const interval = setInterval(generateDummyProcesses, 5000);
    return () => clearInterval(interval);
  }, [generateDummyProcesses]);

  const filteredProcesses = processes.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.pid.toString().includes(searchTerm) ||
    p.user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const endTask = useCallback((pid) => {
    if (window.confirm(`Are you sure you want to end task for PID: ${pid}? (Simulated)`)) {
      setProcesses(prevProcesses => prevProcesses.filter(p => p.pid !== pid));
      console.log(`Simulating ending task for PID: ${pid}`);
    }
  }, []);

  return {
    processes: filteredProcesses,
    searchTerm,
    setSearchTerm,
    endTask,
  };
};

// --- Main Dashboard Component ---
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const SystemMonitorDashboard = () => {
  const [activeTab, setActiveTab] = useState('cpu');
  return (
    <Tabs defaultValue="account" className="w-[400px]">
        <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="account">Make changes to your account here.</TabsContent>
        <TabsContent value="password">Change your password here.</TabsContent>
    </Tabs>
  )
}

//
// const SystemMonitorDashboard = () => {
//   const [activeTab, setActiveTab] = useState('cpu'); // 'cpu', 'memory', 'processes'

//   return (
//     // Explicit dark background for the entire page
//     <div className="min-h-screen bg-gray-950 text-gray-50 p-8 font-sans">
//       <div className="max-w-6xl mx-auto bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
//         {/* Header */}
//         <div className="p-6 border-b border-gray-700 flex justify-between items-center">
//           <h1 className="text-3xl font-bold text-gray-50">Remote PC Monitor</h1>
//         </div>

//         {/* Tabs Navigation */}
//         <div className="flex bg-gray-800 border-b border-gray-700">
//           <Button
//             variant="ghost"
//             // Explicit styling for active/inactive tabs (no blue)
//             className={`flex-1 px-6 py-3 text-lg font-medium rounded-none h-auto transition-colors duration-200
//               ${activeTab === 'cpu' ? 'bg-gray-700 text-white' : 'hover:bg-gray-700 text-gray-300'}`}
//             onClick={() => setActiveTab('cpu')}
//           >
//             CPU
//           </Button>
//           <Button
//             variant="ghost"
//             className={`flex-1 px-6 py-3 text-lg font-medium rounded-none h-auto transition-colors duration-200
//               ${activeTab === 'memory' ? 'bg-gray-700 text-white' : 'hover:bg-gray-700 text-gray-300'}`}
//             onClick={() => setActiveTab('memory')}
//           >
//             Memory
//           </Button>
//           <Button
//             variant="ghost"
//             className={`flex-1 px-6 py-3 text-lg font-medium rounded-none h-auto transition-colors duration-200
//               ${activeTab === 'processes' ? 'bg-gray-700 text-white' : 'hover:bg-gray-700 text-gray-300'}`}
//             onClick={() => setActiveTab('processes')}
//           >
//             Processes
//           </Button>
//         </div>

//         {/* Content Area */}
//         <div className="p-6">
//           {activeTab === 'cpu' && <CpuMonitorSection />}
//           {activeTab === 'memory' && <MemoryMonitorSection />}
//           {activeTab === 'processes' && <ProcessesMonitorSection />}
//         </div>
//       </div>
//     </div>
//   );
// };


export default SystemMonitorDashboard;
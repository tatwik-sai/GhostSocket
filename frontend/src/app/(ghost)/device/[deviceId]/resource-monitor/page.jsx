// import React from 'react'

// const ResourceMonitorPage = () => {
//   return (
//     <div className="flex flex-col h-[100vh] p-3 pb-0 pr-0">
//         <div className="text-white/80 text-3xl font-bold mb-2">
//             Process Manager 
//         </div>
//         <div className="h-[1px] w-full bg-dark-4"></div>

        
//     </div>
//   )
// }

// export default ResourceMonitorPage

// src/app/(ghost)/device/[deviceId]/monitor/page.jsx (Example new page)
'use client'; // This page itself needs to be a client component to render the dashboard

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import SystemMonitorDashboard to ensure it's loaded client-side only
const DynamicSystemMonitorDashboard = dynamic(() => import('./SystemMonitorDashBoard'), {
  ssr: false, // This is crucial for components that interact with browser APIs or complex DOM
  loading: () => (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gray-400 text-xl">
      Loading System Monitor...
    </div>
  ),
});

export default function MonitorPage() {
  return (
    <div className="min-h-screen bg-gray-900"> {/* Ensure main layout has dark background */}
      <DynamicSystemMonitorDashboard />
    </div>
  );
}
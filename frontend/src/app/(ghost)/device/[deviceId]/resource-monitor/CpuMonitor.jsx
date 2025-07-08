import { useCpuDataSimulation } from "./SystemMonitorDashBoard";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';


export const CpuMonitorSection = () => {
 const { cpuUtilization, cpuHistory, cpuInfo, processCount, threadCount, handleCount, uptime } = useCpuDataSimulation();

 const chartConfig = {
   utilization: {
     label: "Utilization",
     color: "hsl(210 20% 70%)", // A light gray for consistency in config
   },
 };

 const formatAxisTick = (tick) => {
   const date = new Date(tick);
   return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
 };

 return (
   <div className="space-y-6">
     <h2 className="text-2xl font-bold text-gray-50 mb-4">CPU Performance</h2>

     <Card className="bg-gray-800 rounded-xl border border-gray-700">
       <CardHeader className="flex flex-row items-center justify-between pb-2">
         <CardTitle className="text-xl font-semibold text-gray-50">{cpuInfo.brand}</CardTitle>
         <div className="text-3xl font-bold text-gray-50">{cpuUtilization}%</div>
       </CardHeader>
       <CardContent>
         <div className="text-gray-400 text-sm mb-2">Usage over the last minute</div>
         <ChartContainer config={chartConfig} className="min-h-[150px] w-full">
           <ResponsiveContainer width="100%" height={150}>
             <BarChart data={cpuHistory} margin={{ top: 5, right: 20, left: 10, bottom: 30 }}>
               <CartesianGrid strokeDasharray="3 3" stroke="#4a4a4a" />
               <XAxis
                 dataKey="date"
                 tickFormatter={formatAxisTick}
                 stroke="#888"
                 style={{ fontSize: '0.7rem' }}
                 interval="preserveStartEnd" // Ensure first and last ticks are visible
               />
               <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} stroke="#888" style={{ fontSize: '0.7rem' }} />
               <Tooltip
                 contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '5px', color: '#fff' }}
                 itemStyle={{ color: '#fff' }}
                 formatter={(value) => [`${value.toFixed(1)}%`, 'Utilization']}
                 labelFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' })}
               />
               <Bar dataKey="utilization" fill="#A1A1A1" name="Utilization" />
             </BarChart>
           </ResponsiveContainer>
         </ChartContainer>
       </CardContent>
     </Card>

     {/* Detailed CPU Info (remains unchanged) */}
     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       <Card className="bg-gray-800 rounded-xl border border-gray-700">
         <CardHeader>
           <CardTitle className="text-xl font-semibold text-gray-50">Live Metrics</CardTitle>
         </CardHeader>
         <CardContent className="space-y-2 text-gray-300">
           <p><span className="text-gray-400">Utilization:</span> <span className="font-bold">{cpuUtilization}%</span></p>
           <p><span className="text-gray-400">Speed:</span> <span className="font-bold">{(cpuInfo.speed).toFixed(2)} GHz</span></p>
           <p><span className="text-gray-400">Processes:</span> <span className="font-bold">{processCount}</span></p>
           <p><span className="text-gray-400">Threads:</span> <span className="font-bold">{threadCount}</span></p>
           <p><span className="text-gray-400">Handles:</span> <span className="font-bold">{handleCount}</span></p>
         </CardContent>
       </Card>

       <Card className="bg-gray-800 rounded-xl border border-gray-700">
         <CardHeader>
           <CardTitle className="text-xl font-semibold text-gray-50">CPU Details</CardTitle>
         </CardHeader>
         <CardContent className="space-y-2 text-gray-300">
           <p><span className="text-gray-400">Base Speed:</span> {(cpuInfo.baseSpeed).toFixed(2)} GHz</p>
           <p><span className="text-gray-400">Max Speed:</span> {(cpuInfo.maxSpeed).toFixed(2)} GHz</p>
           <p><span className="text-gray-400">Sockets:</span> {cpuInfo.sockets}</p>
           <p><span className="text-gray-400">Physical Cores:</span> {cpuInfo.cores}</p>
           <p><span className="text-gray-400">Logical Processors:</span> {cpuInfo.logicalProcessors}</p>
           <p><span className="text-gray-400">Virtualization:</span> {cpuInfo.virtualization}</p>
           <p><span className="text-gray-400">L1 Cache:</span> {cpuInfo.cache.l1} KB</p>
           <p><span className="text-gray-400">L2 Cache:</span> {cpuInfo.cache.l2} KB</p>
           <p><span className="text-gray-400">L3 Cache:</span> {cpuInfo.cache.l3} KB</p>
           <p><span className="text-gray-400">Up Time:</span> {uptime}</p>
         </CardContent>
       </Card>
     </div>
   </div>
 );
};
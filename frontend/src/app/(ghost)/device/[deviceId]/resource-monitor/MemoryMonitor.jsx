import { useMemoryDataSimulation } from "./SystemMonitorDashBoard";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const MemoryMonitorSection = () => {
 const { memoryUtilization, memoryHistory, totalMemory, usedMemory, availableMemory } = useMemoryDataSimulation();

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
     <h2 className="text-2xl font-bold text-gray-50 mb-4">Memory Performance</h2>

     <Card className="bg-gray-800 rounded-xl border border-gray-700">
       <CardHeader className="flex flex-row items-center justify-between pb-2">
         <CardTitle className="text-xl font-semibold text-gray-50">RAM Usage</CardTitle>
         <div className="text-3xl font-bold text-gray-50">{memoryUtilization}%</div>
       </CardHeader>
       <CardContent>
         <div className="text-gray-400 text-sm mb-2">Usage over the last minute</div>
         <ChartContainer config={chartConfig} className="min-h-[150px] w-full">
           <ResponsiveContainer width="100%" height={150}>
             <BarChart data={memoryHistory} margin={{ top: 5, right: 20, left: 10, bottom: 30 }}>
               <CartesianGrid strokeDasharray="3 3" stroke="#4a4a4a" />
               <XAxis
                 dataKey="date"
                 tickFormatter={formatAxisTick}
                 stroke="#888"
                 style={{ fontSize: '0.7rem' }}
                 interval="preserveStartEnd"
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

     {/* Detailed Memory Info (remains unchanged) */}
     <Card className="bg-gray-800 rounded-xl border border-gray-700">
       <CardHeader>
         <CardTitle className="text-xl font-semibold text-gray-50">Memory Details</CardTitle>
       </CardHeader>
       <CardContent className="space-y-2 text-gray-300">
         <p><span className="text-gray-400">Total Memory:</span> <span className="font-bold">{totalMemory}</span></p>
         <p><span className="text-gray-400">Used Memory:</span> <span className="font-bold">{usedMemory}</span></p>
         <p><span className="text-gray-400">Available Memory:</span> <span className="font-bold">{availableMemory}</span></p>
         <p><span className="text-gray-400">Utilization:</span> <span className="font-bold">{memoryUtilization}%</span></p>
       </CardContent>
     </Card>
   </div>
 );
};
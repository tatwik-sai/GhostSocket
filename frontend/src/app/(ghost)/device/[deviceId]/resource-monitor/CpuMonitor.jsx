"use client"

import React, {useEffect} from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useStreamsAndConnectionStore } from "@/store/slices/ActiveConnection/StreamsAndConnectionSlice"
import { useResourcesStore } from "@/store/slices/ActiveConnection/ResourcesSlice"


const chartConfig = {
  views: {
    label: "CPU",
  },
}

function StaticCpuCard() {
    const {staticCPUInfo} = useResourcesStore()
    const {tcpDataChannel} = useStreamsAndConnectionStore()
    useEffect(() => {
        const {staticCPUInfo} = useResourcesStore.getState()
        const {tcpDataChannel} = useStreamsAndConnectionStore.getState()
        if (Object.entries(staticCPUInfo).length === 0 && tcpDataChannel && tcpDataChannel.readyState === 'open') {
            tcpDataChannel.send(JSON.stringify({type: "get_static_cpu_info"}));
        }
    }, [tcpDataChannel])
    
    return (
        <Card className="py-0 bg-dark-3 border-none  w-full xl:w-1/2">
            <CardHeader className="flex justify-between items-center border-[#ffffff1a] border-b-[1px]">
                <div className="py-6 space-y-1">
                    <CardTitle className="text-white">
                        System Specs
                    </CardTitle>
                    <CardDescription className="text-[#a1a1a1]">
                        A comprehensive overview of the CPU hardware configuration
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="p-2 pr-2">
                <div className="flex flex-col gap-6 overflow-hidden">
                    <div className="flex gap-4">
                        <div className="flex">

                            <div
                            className="border-[#ffffff1a] flex flex-col justify-center gap-1
                             px-3 py-2 text-left"
                            >
                                <span className="text-muted-foreground text-xs text-[#a1a1a1]">
                                    Cores
                                </span>
                                <span className="text-lg leading-none font-bold sm:text-3xl">
                                    {staticCPUInfo.cores}
                                </span>
                            </div>

                        </div>
                        <div className="flex">
                            <div
                            className="border-[#ffffff1a] flex flex-col justify-center gap-1
                             px-7 py-2 text-left border-l"
                            >
                                <span className="text-muted-foreground text-xs text-[#a1a1a1]">
                                    Logical Processors
                                </span>
                                <span className="text-lg leading-none font-bold sm:text-3xl">
                                    {staticCPUInfo.logicalProcessors}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex">

                            <div
                            className="border-[#ffffff1a] flex flex-col justify-center gap-1
                             px-3 py-2 text-left"
                            >
                                <span className="text-muted-foreground text-xs text-[#a1a1a1]">
                                    Base Speed
                                </span>
                                <span className="text-lg leading-none font-bold sm:text-3xl">
                                    {staticCPUInfo.baseSpeed}
                                </span>
                            </div>

                        </div>
                        <div className="flex">
                            <div
                            className="border-[#ffffff1a] flex flex-col justify-center gap-1
                             px-7 py-2 text-left border-l"
                            >
                                <span className="text-muted-foreground text-xs text-[#a1a1a1]">
                                    Sockets
                                </span>
                                <span className="text-lg leading-none font-bold sm:text-3xl">
                                    {staticCPUInfo.sockets}
                                </span>
                            </div>
                        </div>
                        <div className="flex">
                            <div
                            className="border-[#ffffff1a] flex flex-col justify-center gap-1
                             px-7 pr-4 py-2 text-left border-l"
                            >
                                <span className="text-muted-foreground text-xs text-[#a1a1a1]">
                                    Virtualization
                                </span>
                                <span className="text-lg leading-none font-bold sm:text-3xl">
                                    {staticCPUInfo.virtualizationEnabled}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex">

                            <div
                            className="border-[#ffffff1a] flex flex-col justify-center gap-1
                             px-3 py-2 text-left"
                            >
                                <span className="text-muted-foreground text-xs text-[#a1a1a1]">
                                    L2 Cache
                                </span>
                                <span className="text-lg leading-none font-bold sm:text-3xl">
                                    {staticCPUInfo.l2Cache}
                                </span>
                            </div>

                        </div>
                        <div className="flex">
                            <div
                            className="border-[#ffffff1a] flex flex-col justify-center gap-1
                             px-7 py-2 text-left border-l"
                            >
                                <span className="text-muted-foreground text-xs text-[#a1a1a1]">
                                    L3 Cache
                                </span>
                                <span className="text-lg leading-none font-bold sm:text-3xl">
                                    {staticCPUInfo.l3Cache}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function DynamicCpuCard() {
    const {dynamicCPUInfo} = useResourcesStore()
    return (
        <Card className="py-0 bg-dark-3 border-none  w-full xl:w-1/2">
            <CardHeader className="flex justify-between items-center border-[#ffffff1a] border-b-[1px]">
                <div className="py-6 space-y-1">
                    <CardTitle className="text-white">
                        Realtime Metrics
                    </CardTitle>
                    <CardDescription className="text-[#a1a1a1]">
                        Real-time preview of CPU usage and performance
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="p-2 pr-2">
                <div className="flex flex-col gap-6 overflow-hidden">
                    <div className="flex gap-4">
                        <div className="flex">

                            <div
                            className="border-[#ffffff1a] flex flex-col justify-center gap-1
                             px-3 py-2 text-left"
                            >
                                <span className="text-muted-foreground text-xs text-[#a1a1a1]">
                                    Utilization
                                </span>
                                <span className="text-lg leading-none font-bold sm:text-3xl">
                                    {dynamicCPUInfo.utilization}%
                                </span>
                            </div>

                        </div>
                        <div className="flex">
                            <div
                            className="border-[#ffffff1a] flex flex-col justify-center gap-1
                             px-7 py-2 text-left border-l"
                            >
                                <span className="text-muted-foreground text-xs text-[#a1a1a1]">
                                    Speed
                                </span>
                                <span className="text-lg leading-none font-bold sm:text-3xl">
                                    {dynamicCPUInfo.currentSpeed}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex">

                            <div
                            className="border-[#ffffff1a] flex flex-col justify-center gap-1
                             px-3 py-2 text-left"
                            >
                                <span className="text-muted-foreground text-xs text-[#a1a1a1]">
                                    Processes
                                </span>
                                <span className="text-lg leading-none font-bold sm:text-3xl">
                                    {dynamicCPUInfo.processes}
                                </span>
                            </div>

                        </div>
                        <div className="flex">
                            <div
                            className="border-[#ffffff1a] flex flex-col justify-center gap-1
                             px-7 pr-4 py-2 text-left border-l"
                            >
                                <span className="text-muted-foreground text-xs text-[#a1a1a1]">
                                    Threads
                                </span>
                                <span className="text-lg leading-none font-bold sm:text-3xl">
                                    {dynamicCPUInfo.threads}
                                </span>
                            </div>
                        </div>
                        <div className="flex">
                            <div
                            className="border-[#ffffff1a] flex flex-col justify-center gap-1
                             px-7 py-2 text-left border-l"
                            >
                                <span className="text-muted-foreground text-xs text-[#a1a1a1]">
                                    Handles
                                </span>
                                <span className="text-lg leading-none font-bold sm:text-3xl">
                                    {dynamicCPUInfo.handles}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex">

                            <div
                            className="border-[#ffffff1a] flex flex-col justify-center gap-1
                             px-3 py-2 text-left"
                            >
                                <span className="text-muted-foreground text-xs text-[#a1a1a1]">
                                    Up time
                                </span>
                                <span className="text-lg leading-none font-bold sm:text-3xl">
                                    {dynamicCPUInfo.upTime}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function CpuUtilizationGraph() {
    const { staticCPUInfo, dynamicCPUInfo, cpuChartData } = useResourcesStore()
    
  return (
    <Card className="py-0 bg-dark-3 border-none ">
      <CardHeader className="flex flex-col items-stretch border-b border-[#ffffff1a] !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
          <CardTitle>{staticCPUInfo.brand}</CardTitle>
          <CardDescription className="text-[#a1a1a1]">
            Showing usage for the last few minutes
          </CardDescription>
        </div>
        <div className="flex">
            <div
            className="border-[#ffffff1a] relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
            >
            <span className="text-muted-foreground text-xs text-[#a1a1a1]">
                Speed
            </span>
            <span className="text-lg leading-none font-bold sm:text-3xl">
                {dynamicCPUInfo.currentSpeed}
            </span>
            </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={cpuChartData}
            >
            <CartesianGrid vertical={false} stroke="#ffffff1a" opacity={0.5}/>
            <ChartTooltip className="border-[#ffffff1a] bg-black z-100" cursor={{ fill: "#ffffff1a" , opacity: 0.3 }}
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="views"
                  labelFormatter={(value) => {
                    return "Usage"
                  }}
                />
              }
            />
            <Bar 
                dataKey={"usage"}
                fill={`#6C28D9`}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}


export function CpuLayout() {
    const {setActiveTab} = useResourcesStore();
    
    useEffect(() => {
        setActiveTab("cpu");
    }, [setActiveTab]);

    useEffect(() => {
        const {tcpDataChannel} = useStreamsAndConnectionStore.getState();
        if (tcpDataChannel && tcpDataChannel.readyState === 'open') {
            tcpDataChannel.send(JSON.stringify({type: "get_threads_and_handles"}));
        }
        
    }, []);
    return (
        <div className="flex flex-col gap-4 h-full">
            <CpuUtilizationGraph />
            <div className="flex flex-col xl:flex-row gap-4 flex-1 xl:flex-none">
                <DynamicCpuCard />
                <StaticCpuCard />
            </div>
        </div>
            
    )
}
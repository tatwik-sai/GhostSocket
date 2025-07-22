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
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useResourcesStore } from "@/store/slices/ActiveConnection/ResourcesSlice"
import { useStreamsAndConnectionStore } from "@/store/slices/ActiveConnection/StreamsAndConnectionSlice"

const chartConfig = {
  views: {
    label: "CPU",
  },
}

function StaticMemoryCard() {
    const {staticMemoryInfo } = useResourcesStore();
    return (
        <Card className="py-0 bg-dark-3 border-none  w-full xl:w-1/2">
            <CardHeader className="flex justify-between items-center border-[#ffffff1a] border-b-[1px]">
                <div className="py-6 space-y-1">
                    <CardTitle className="text-white">
                        System Specs
                    </CardTitle>
                    <CardDescription className="text-[#a1a1a1]">
                        A comprehensive overview of the Memory's hardware configuration
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="p-2 pr-2">
                <div className="flex flex-col gap-6 overflow-hidden">
                    <div className="flex gap-4">
                        <div className="flex">

                            <div
                            className="border-[#ffffff1a] flex flex-col justify-center gap-1
                             px-3 pr-8 py-2 text-left"
                            >
                                <span className="text-muted-foreground text-xs text-[#a1a1a1]">
                                    Total Memory
                                </span>
                                <span className="text-lg leading-none font-bold sm:text-3xl">
                                    {staticMemoryInfo.totalGB}
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
                                    {staticMemoryInfo.speedMTs}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex">

                            <div
                            className="border-[#ffffff1a] flex flex-col justify-center gap-1
                             px-3 pr-16 py-2 text-left"
                            >
                                <span className="text-muted-foreground text-xs text-[#a1a1a1]">
                                    Slots Used
                                </span>
                                <span className="text-lg leading-none font-bold sm:text-3xl">
                                    {staticMemoryInfo.slotsUsed}
                                </span>
                            </div>

                        </div>
                        <div className="flex">
                            <div
                            className="border-[#ffffff1a] flex flex-col justify-center gap-1
                             px-7 py-2 text-left border-l"
                            >
                                <span className="text-muted-foreground text-xs text-[#a1a1a1]">
                                    Form factor
                                </span>
                                <span className="text-lg leading-none font-bold sm:text-3xl">
                                    {staticMemoryInfo.formFactor}
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
                                    Disk Size
                                </span>
                                <span className="text-lg leading-none font-bold sm:text-3xl">
                                    {staticMemoryInfo.diskTotalGB}
                                </span>
                            </div>

                        </div>
                        <div className="flex">
                            <div
                            className="border-[#ffffff1a] flex flex-col justify-center gap-1
                             px-7 py-2 text-left border-l"
                            >
                                <span className="text-muted-foreground text-xs text-[#a1a1a1]">
                                    Free Space
                                </span>
                                <span className="text-lg leading-none font-bold sm:text-3xl">
                                    {staticMemoryInfo.diskFreeGB}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function DynamicMemoryCard() {
    const {dynamicMemoryInfo} = useResourcesStore();
    return (
        <Card className="py-0 bg-dark-3 border-none  w-full xl:w-1/2">
            <CardHeader className="flex justify-between items-center border-[#ffffff1a] border-b-[1px]">
                <div className="py-6 space-y-1">
                    <CardTitle className="text-white">
                        Realtime Metrics
                    </CardTitle>
                    <CardDescription className="text-[#a1a1a1]">
                        Real-time preview of Memory usage and performance
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
                                    In use
                                </span>
                                <span className="text-lg leading-none font-bold sm:text-3xl">
                                    {dynamicMemoryInfo.usedGB}
                                </span>
                            </div>

                        </div>
                        <div className="flex">
                            <div
                            className="border-[#ffffff1a] flex flex-col justify-center gap-1
                             px-7 py-2 text-left border-l"
                            >
                                <span className="text-muted-foreground text-xs text-[#a1a1a1]">
                                    Available
                                </span>
                                <span className="text-lg leading-none font-bold sm:text-3xl">
                                    {dynamicMemoryInfo.availableGB}
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
                                    Paged Pool
                                </span>
                                <span className="text-lg leading-none font-bold sm:text-3xl">
                                    {dynamicMemoryInfo.pagedPool}
                                </span>
                            </div>

                        </div>
                        <div className="flex">
                            <div
                            className="border-[#ffffff1a] flex flex-col justify-center gap-1
                             px-7 py-2 text-left border-l"
                            >
                                <span className="text-muted-foreground text-xs text-[#a1a1a1]">
                                    Non-paged pool
                                </span>
                                <span className="text-lg leading-none font-bold sm:text-3xl">
                                    {dynamicMemoryInfo.nonPagedPool}
                                </span>
                            </div>
                        </div>
                        <div className="flex">
                            <div
                            className="border-[#ffffff1a] flex flex-col justify-center gap-1
                             px-7 pr-4 py-2 text-left border-l"
                            >
                                <span className="text-muted-foreground text-xs text-[#a1a1a1]">
                                    Cached
                                </span>
                                <span className="text-lg leading-none font-bold sm:text-3xl">
                                    {dynamicMemoryInfo.systemCatch}
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
                                    Utilization
                                </span>
                                <span className="text-lg leading-none font-bold sm:text-3xl">
                                    {dynamicMemoryInfo.utilization}%
                                </span>
                            </div>

                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function MemoryUtilizationGraph() {
    const { staticMemoryInfo, memoryChartData} = useResourcesStore();
  return (
    <Card className="py-0 bg-dark-3 border-none   ">
      <CardHeader className="flex flex-col items-stretch border-b border-[#ffffff1a] !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
          <CardTitle>{staticMemoryInfo.manufacturers}</CardTitle>
          <CardDescription className="text-[#a1a1a1]">
            Showing usage for the last few minutes
          </CardDescription>
        </div>
        <div className="flex">
            <div
            className="border-[#ffffff1a] relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
            >
            <span className="text-muted-foreground text-xs text-[#a1a1a1]">
                Total Memory
            </span>
            <span className="text-lg leading-none font-bold sm:text-3xl">
                {staticMemoryInfo.totalGB}
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
            data={memoryChartData}
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


export function MemoryLayout() {
    const {setActiveTab} = useResourcesStore()
    useEffect(() => {
        setActiveTab("memory")
        const {tcpDataChannel} = useStreamsAndConnectionStore.getState();
        if (!tcpDataChannel) return;
        tcpDataChannel.send(JSON.stringify({type: "get_dynamic_memory_info"}));
    }, [setActiveTab])
    return (
        <div className="flex flex-col gap-4 h-full">
            <MemoryUtilizationGraph />
            <div className="flex flex-col xl:flex-row gap-4 flex-1 xl:flex-none">
                <DynamicMemoryCard />
                <StaticMemoryCard />
            </div>
        </div>
            
    )
}
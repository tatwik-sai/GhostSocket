import { create } from "zustand";

export const createResourcesSlice = (set) => ({
  staticCPUInfo: {},
  dynamicCPUInfo: {},
  staticMemoryInfo: {},
  dynamicMemoryInfo: {},
  processesList: [],
  resourceActive: false,
  activeTab: "cpu",
  setActiveTab: (tab) => set({ activeTab: tab }),
  cpuChartData: [...Array(100).fill({usage: 0})],
  memoryChartData: [...Array(100).fill({usage: 0})],
  setProcessesList: (processes) => set({ processesList: processes }),
  addToCPUChartData: (value) => {
    set((state) => {
      const newData = [...state.cpuChartData];
      newData.push({usage: value});
      if (newData.length > 100) {
        newData.shift();
      }
      return { cpuChartData: newData };
    });
  },
  addToMemoryChartData: (value) => {
    set((state) => {
      const newData = [...state.memoryChartData];
      newData.push({usage: value});
      if (newData.length > 100) {
        newData.shift();
      }
      return { memoryChartData: newData };
    });
  },
  setResourceActive: (active) => set({ resourceActive: active }),
  setStaticCPUInfo: (info) => set({ staticCPUInfo: info }),
  setDynamicCPUInfo: (info) => set({ dynamicCPUInfo: info }),
  setStaticMemoryInfo: (info) => set({ staticMemoryInfo: info }),
  setDynamicMemoryInfo: (info) => set({ dynamicMemoryInfo: info }),
  resetCPUChartData: () => set({ cpuChartData: [...Array(100).fill({usage: 0})] }),
  resetMemoryChartData: () => set({ memoryChartData: [...Array(100).fill({usage: 0})] }), 
  resetResources: () => set({
    staticCPUInfo: {},
    dynamicCPUInfo: {},
    staticMemoryInfo: {},
    dynamicMemoryInfo: {},
    processesList: [],
    resourceActive: false,
    activeTab: "cpu",
    cpuChartData: [...Array(100).fill({usage: 0})],
    memoryChartData: [...Array(100).fill({usage: 0})],
  }),
});

export const useResourcesStore = create(createResourcesSlice);
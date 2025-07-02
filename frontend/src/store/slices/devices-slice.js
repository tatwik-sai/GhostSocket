import { create } from "zustand";

export const createDevicesSlice = (set) => ({
  myDevices: [],
  otherDevices: [],
  addMyDevice: (device) => set((state) => ({ myDevices: [...state.myDevices, device] })),
  removeMyDevice: (deviceId) => set((state) => ({
    myDevices: state.myDevices.filter((device) => device.id !== deviceId)
  })),
  setMyDevices: (devices) => set({ myDevices: devices }),
  addOtherDevice: (device) => set((state) => ({ otherDevices: [...state.otherDevices, device] })),
  removeOtherDevice: (deviceId) => set((state) => ({
    otherDevices: state.otherDevices.filter((device) => device.id !== deviceId)
  })),
  setOtherDevices: (devices) => set({ otherDevices: devices }),
});

export const useDevicesStore = create(createDevicesSlice);

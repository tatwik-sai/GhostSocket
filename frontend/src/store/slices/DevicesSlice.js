import { create } from "zustand";

export const createDevicesSlice = (set) => ({
  myDevices: [],
  otherDevices: [],
  editingId: null,
  setEditingId: (id) => set({ editingId: id }),
  setDeviceName: (deviceId, newName, type) => {
    set((state) => {
      const currentDevices = type === 'myDevices' ? state.myDevices : state.otherDevices;
      
      if (!currentDevices || !Array.isArray(currentDevices)) {
        console.warn(`${type}Devices is not an array:`, currentDevices);
        return state;
      }

      const updatedDevices = currentDevices.map(device => 
        device._id === deviceId 
          ? { ...device, name: newName }
          : device
      );

      return {
        ...state,
        [type]: updatedDevices
      };
    });
  },
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

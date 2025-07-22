import { create } from "zustand";

export const createDevicesSlice = (set, get) => ({
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
  getDeviceById: (deviceId, type) => {
    const state = get();
    const devices = type === 'myDevices' ? state.myDevices : state.availableDevices;
    return devices.find(device => 
      device._id === deviceId || 
      device.deviceId === deviceId ||
      device.id === deviceId
    );
  },
  removeMyDevice: (deviceId) => set((state) => ({
    myDevices: state.myDevices.filter((device) => device.deviceId !== deviceId)
  })),
  setMyDevices: (devices) => set({ myDevices: devices }),
  addOtherDevice: (device) => set((state) => ({ otherDevices: [...state.otherDevices, device] })),
  removeOtherDevice: (deviceId) => set((state) => ({
    otherDevices: state.otherDevices.filter((device) => device.deviceId !== deviceId)
  })),
  setOtherDevices: (devices) => set({ otherDevices: devices }),
  updateDeviceOnlineStatus: (deviceId, isOnline) => set((state) => {
    const updateStatus = (devices) => devices.map(device => 
      device.deviceId === deviceId ? { ...device, status: isOnline ? 'online' : 'offline' } : device
    );

    return {
      myDevices: updateStatus(state.myDevices),
      otherDevices: updateStatus(state.otherDevices)
    };
  }),
  updateDeviceInUseStatus: (deviceId, inUse) => set((state) => {
    const updateInUseStatus = (devices) => devices.map(device => 
      device._id === deviceId ? { ...device, inUse } : device
    );

    return {
      myDevices: updateInUseStatus(state.myDevices),
      otherDevices: updateInUseStatus(state.otherDevices)
    };
  }),
});

export const useDevicesStore = create(createDevicesSlice);

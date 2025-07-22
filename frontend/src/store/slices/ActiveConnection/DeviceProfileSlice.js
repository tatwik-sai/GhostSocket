import { create } from "zustand";

export const createDeviceProfileSlice = (set) => ({
    deviceInfo: null,
    permissions: null,
    setDeviceInfo: (deviceInfo) => set({ deviceInfo }),
    setPermissions: (permissions) => set({ permissions }),
    updateDeviceInfo: (newInfo) => set((state) => {
        return {
            deviceInfo: { ...state.deviceInfo, ...newInfo }
        };
    }),
    resetDeviceProfile: () => set({ deviceInfo: null, permissions: null }),
});


export const useDeviceProfileStore = create(createDeviceProfileSlice);
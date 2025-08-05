import { create } from "zustand";

export const createRemoteControlSlice = (set) => ({
  images: [],
  controlling: false,
  screenDimensions: { width: 0, height: 0 },
  scaledScreenDimensions: { width: 0, height: 0, left: 0, top: 0 },
  setScaledScreenDimensions: (width, height, left, top) => set(() => ({ scaledScreenDimensions: { width, height, left, top } })),
  setScreenDimensions: (width, height) => set(() => ({ screenDimensions: { width, height } })),
  setControlling: (controlling) => set(() => ({ controlling })),
  addImage: (image) => set((state) => ({ images: [image, ...state.images] })),
  setImages: (images) => set(() => ({ images })),
  resetRemoteControl: () => set(() => ({ images: [], controlling: false, screenDimensions: { width: 0, height: 0 } })),
});

export const useRemoteControlStore = create(createRemoteControlSlice);
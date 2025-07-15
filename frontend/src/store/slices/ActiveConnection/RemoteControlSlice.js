import { create } from "zustand";

export const createRemoteControlSlice = (set) => ({
  images: [],
  controlling: false,
  setControlling: (controlling) => set(() => ({ controlling })),
  addImage: (image) => set((state) => ({ images: [image, ...state.images] })),
  setImages: (images) => set(() => ({ images })),
  resetRemoteControl: () => set(() => ({ images: [], controlling: false })),
});

export const useRemoteControlStore = create(createRemoteControlSlice);
import { create } from "zustand";

export const createWebcamSlice = (set) => ({
  images: [],
  addImage: (image) => set((state) => ({ images: [image, ...state.images] })),
  setImages: (images) => set(() => ({ images })),
  resetWebCam: () => set(() => ({ images: [] })),
});

export const useWebCamStore = create(createWebcamSlice);
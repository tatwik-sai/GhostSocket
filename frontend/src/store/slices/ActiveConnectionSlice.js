import { create } from "zustand";

export const createActiveConnectionSlice = (set) => ({
  peerConnection: null,
  screenStream: null,
  webcamStream: null,
  setPeerConnection: (pc) => {
    set((state) => ({
      peerConnection: pc,
    }));
  },
  setScreenStream: (stream) => {
    set((state) => ({
      screenStream: stream,
    }));
  },
  setWebcamStream: (stream) => {
    set((state) => ({
      webcamStream: stream,
    }));
  },
});

export const useActiveConnectionStore = create(createActiveConnectionSlice);

import { create } from "zustand";

export const createStreamsAndConnectionSlice = (set) => ({
  peerConnection: null,
  screenStream: null,
  webcamStream: null,
  audioStream: null,
  udpDataChannel: null,
  tcpDataChannel: null,
  setTcpDataChannel: (channel) => {
    set((state) => ({
      tcpDataChannel: channel,
    }));
  },
  setUdpDataChannel: (channel) => {
    set((state) => ({
      udpDataChannel: channel,
    }));
  },
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
  setAudioStream: (stream) => {
    set((state) => ({
      audioStream: stream,
    }));
  },
  resetStreamsAndConnection: () => {
    set((state) => ({
    peerConnection: null,
    screenStream: null,
    webcamStream: null,
    audioStream: null,
    udpDataChannel: null,
    tcpDataChannel: null,
    }));
  },
});

export const useStreamsAndConnectionStore = create(createStreamsAndConnectionSlice);
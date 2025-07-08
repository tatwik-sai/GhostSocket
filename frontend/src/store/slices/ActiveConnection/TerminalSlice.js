// create a zustand slice for terminal management

import { create } from "zustand";

export const createTerminalSlice = (set, get) => ({
  currentPath: null,
  xtermInstance: null,
  systemUserName: null,
  terminalExecutions: [],
  isExecuting: false,
  setIsExecuting: (isExecuting) => {
    set((state) => ({
      isExecuting: isExecuting,
    }));
  },
  getPrompt: () => {
    const state = get();
    return `\x1b[1;32m┌──(\x1b[1;34muser㉿${state.systemUserName}\x1b[1;32m)-[\x1b[1;37m${state.currentPath}\x1b[1;32m]\r\n└─\x1b[1;34m$\x1b[0m `;
  },
  setXtermInstance: (instance) => {
    set((state) => ({
      xtermInstance: instance,
    }));
  },
  addToTerminalExecutions: (execution) => {
    set((state) => ({
      terminalExecutions: [...state.terminalExecutions, execution],
    }));
  },
  setCurrentPath: (path) => {
    set((state) => ({
      currentPath: path,
    }));
  },
  setSystemUserName: (name) => {
    set((state) => ({
      systemUserName: name,
    }));
  },
});

export const useTerminalStore = create(createTerminalSlice);

// Create a zustand slice for file management
import { create } from "zustand";

export const createFileSlice = (set) => ({
  files: {
    root: {
      "*type": "directory",
    }
  },
  currentFilePath: ["root"],
  selectedFiles: [],
  isDownloading: false,
  isRefreshing: false,
  downloadFileSize: 0,
  downloadedFileSize: 0,
  downloadProgress: 0,
  numDownloadingFiles: 0,
  setDownloadFileSize: (size) => {
    set((state) => ({
      downloadFileSize: size,
    }));
  },
  setDownloadedFileSize: (size) => {
    set((state) => ({
      downloadedFileSize: size,
    }));
  },
  setNumDownloadingFiles: (num) => {
    set((state) => ({
      numDownloadingFiles: num,
    }));
  },
  setDownloadProgress: (progress) => {
    set((state) => ({
      downloadProgress: progress,
    }));
  },
  setIsDownloading: (value) => {
    set((state) => ({
      isDownloading: value,
    }));
  },
  setIsRefreshing: (value) => {
    set((state) => ({
      isRefreshing: value,
    }));
  },
  addFilesToPath: (path, items) => {
    set((state) => {
      const newFiles = JSON.parse(JSON.stringify(state.files)); // Deep copy
      let current = newFiles;

      // Traverse to the target location
      for (const segment of path) {
        if (!current[segment]) current[segment] = { "*type": "directory" };
        current = current[segment];
      }

      // Add each item into the current location
      for (const item of items) {
        const name = item["*name"];
        const newEntry = {};

        for (const key in item) {
          if (key !== "*name") {
            newEntry[key] = item[key];
          }
        }

        current[name] = newEntry;
      }

      return { files: newFiles };
    });
  },
  updateFilesToPath: (path, items) => {
    set((state) => {
      const newFiles = JSON.parse(JSON.stringify(state.files));
      let current = newFiles;

      for (const segment of path) {
        if (!current[segment]) current[segment] = { "*type": "directory" };
        current = current[segment];
      }

      const itemNamesToKeep = new Set(items.map(item => item["*name"]));

      for (const key of Object.keys(current)) {
        if (!key.startsWith("*") && !itemNamesToKeep.has(key)) {
          delete current[key];
        }
      }

      for (const item of items) {
        const name = item["*name"];
        const newEntry = {};

        for (const key in item) {
          if (key !== "*name") {
            newEntry[key] = item[key];
          }
        }

        current[name] = newEntry;
      }

      return { files: newFiles };
    });
  },
  setCurrentFilePath: (path) => {
    set((state) => ({
      currentFilePath: path,
    }));
  },
  setSelectedFiles: (files) => {
    set((state) => ({
      selectedFiles: files,
    }));
  },
  resetFileStore: () => {
    set(() => ({
      files: {
        root: {
          "*type": "directory",
        }
      },
      currentFilePath: ["root"],
      selectedFiles: [],
      isDownloading: false,
      isRefreshing: false,
      downloadFileSize: 0,
      downloadedFileSize: 0,
      downloadProgress: 0,
      numDownloadingFiles: 0,
    }));
  }
});


export const useFileStore = create(createFileSlice);
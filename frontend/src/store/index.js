import { create } from "zustand";
import { createChatSlice } from "./slices/chat-slice";

export const useAppStore = create()((...args) => ({
    ...createChatSlice(...args),
}))
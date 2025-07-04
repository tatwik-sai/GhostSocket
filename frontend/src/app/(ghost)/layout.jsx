"use client"
import { SocketProvider } from "@/context/SocketContext";
import React from "react";  

export default function GhostLayout({ children }) {
  return (
    <SocketProvider>
      {children}
    </SocketProvider>
  );
}
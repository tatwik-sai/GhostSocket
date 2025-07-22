"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@clerk/nextjs";
import { HOST } from "@/utils/constants";

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const socket = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const { getToken } = useAuth();

  useEffect(() => {
    const connectSocket = async () => {
      try {
        if (!getToken) {
          console.error("getToken is not available");
          return;
        }
        console.log("Connecting socket with token...");
        socket.current = io(HOST, {
          auth: async (cb) => {
            const freshToken = await getToken();
            cb({ token: freshToken, type: "user" });
          },
        });

        socket.current.on("connect", () => {
          console.log("Connected to socket");
          setIsConnected(true);
        });

        socket.current.on("disconnect", () => {
          console.log("Disconnected from socket");
          setIsConnected(false);
        });

        socket.current.on("connect_error", (error) => {
          console.error("Socket connection error:", error);
          setIsConnected(false);
        });

      } catch (err) {
        console.error("Failed to connect socket:", err);
        setIsConnected(false);
      }
    };

    connectSocket();

    return () => {
      if (socket.current) {
        socket.current.disconnect();
        setIsConnected(false);
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{socket, isConnected}}>
      {children}
    </SocketContext.Provider>
  );
};

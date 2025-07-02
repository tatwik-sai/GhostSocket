"use client"
import { createContext,useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useUser } from "@clerk/nextjs";
import { HOST } from "@/utils/constants";

const SocketContext = createContext(null);

export const useSocket = () => {
    return useContext(SocketContext);
}

export const SocketProvider = ({children}) => {
    const socket = useRef();
    const {user} = useUser();
    console.log("USer:", user);
    useEffect(() => {
        if (user){
            console.log("hi1", HOST)
            socket.current = io(HOST, {
                withCredentials: true,
                query: {userId: user.id, type: "user"}
            })
            socket.current.on("connect", () => {
                console.log("Connected to socket server");
            })
        }
    }, [user]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
}

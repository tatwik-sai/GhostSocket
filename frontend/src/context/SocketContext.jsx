// "use client"
// import { createContext,useContext, useEffect, useRef } from "react";
// import { io } from "socket.io-client";
// import { useAuth } from "@clerk/nextjs";
// import { HOST } from "@/utils/constants";

// const SocketContext = createContext(null);

// export const useSocket = () => {
//     return useContext(SocketContext);
// }

// export const SocketProvider = ({children}) => {
//     const socket = useRef();
//     const { getToken } = useAuth();

//     useEffect(() => {
//         async function connectSocket() {
//       if (getToken) {
//         const token = await getToken();
//         console.log("Token:",token)
//         socket.current = io(HOST, {
//             withCredentials: true,
//             auth: {
//             token,
//             type: "user",
//             },
//         });

//         socket.current.on("connect", () => {
//           console.log("Connected to socket server");
//         });
//       }
//     }
//     connectSocket();
//     }, [getToken]);

//     return (
//         <SocketContext.Provider value={socket}>
//             {children}
//         </SocketContext.Provider>
//     )
// }
"use client";
import { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@clerk/nextjs";
import { HOST } from "@/utils/constants";

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const socket = useRef(null);
  const { getToken } = useAuth();

  useEffect(() => {
    const connectSocket = async () => {
      try {
        const token = await getToken();
        if (!token) return console.warn("No token found");

        socket.current = io(HOST, {
          withCredentials: true,
          auth: {
            token,
            type: "user",
          },
        });

        socket.current.on("connect", () => {
          console.log("Connected to socket");
        });

      } catch (err) {
        console.error("Failed to connect socket:", err);
      }
    };

    connectSocket();

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [getToken]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

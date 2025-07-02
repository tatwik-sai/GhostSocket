import { Server } from "socket.io";

const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:3000",
            credentials: true
        }
    })
    const userSocketMap = new Map();
    const deviceSocketMap = new Map();

    io.on("connection", (socket) => {
      console.log("Socket connected:", socket.id);
      const type = socket.handshake.query.type;
      if(type === "user"){
        const userId = socket.handshake.query.userId;
        userSocketMap.set(userId, socket.id);

        
      }else if(type === "device"){
        const deviceId = socket.handshake.query.deviceId;
        deviceSocketMap.set(deviceId, socket.id);
      
        
      
      }
      });
      
}
export default setupSocket;
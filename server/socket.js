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

        socket.on("rtc-offer", (data) => {
          io.to(deviceSocketMap.get(data.deviceId)).emit("offer", {sdp: data.sdp, type: data.type, userId: data.userId});
        });

        socket.on("ice-candidate", (data) => {
          io.to(deviceSocketMap.get(data.deviceId)).emit("ice-candidate", data.data);
        });
      }else if(type === "device"){
        const deviceId = socket.handshake.query.deviceId;
        deviceSocketMap.set(deviceId, socket.id);
      
        socket.on("answer", (data) => {
          io.to(userSocketMap.get(data.userId)).emit("answer", {sdp: data.sdp, type: data.type, deviceId: data.deviceId});
        });

        socket.on("ice-candidate", (data) => {
          io.to(userSocketMap.get(data.userId)).emit("ice-candidate", data.data);
        });
      
      }
      });
      
}
export default setupSocket;
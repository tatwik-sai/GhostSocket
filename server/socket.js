import { Server } from "socket.io";
import { verifyToken } from "@clerk/backend";
import dotenv from "dotenv";
import DBDevice from "./models/DevicesModel";
import DBUserDeviceLinks from "./models/UserDeviceLinksModel";
dotenv.config();
const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:3000",
            credentials: true
        }
    })
    const userSocketMap = new Map();
    const deviceSocketMap = new Map();

    io.on("connection", async (socket) => {
      const {token, type, deviceId} = socket.handshake.auth;
      if(type === "user"){
        // Verify the token and get user ID and add it to the userSocketMap
        const decoded = await verifyToken(token, {secretKey: process.env.CLERK_SECRET_KEY});
        const userId = decoded.sub;
        userSocketMap.set(userId, socket.id);
        console.log(`User connected: ${userId}, Socket ID: ${socket.id}`);

        // On Disconnect, remove the user from the map
        socket.on("disconnect", () => {
          console.log(`User disconnected: ${userId}, Socket ID: ${socket.id}`);
          userSocketMap.delete(userId);
        });

        // Start a WebRTC session with a device
        socket.on("initiate-webrtc", async (data) => {
          console.log(`User ${userId} requested to start a session with ${data.deviceId}`);
          const device = await DBDevice.findById(data.deviceId);
          const userDeviceLink = await DBUserDeviceLinks.findOne({ userId, deviceId: data.deviceId });
          if (!userDeviceLink) {
            console.error(`User ${userId} don't have permissions for device ${data.deviceId}`);
            return;
          }
          if (device.status !== "online") {
            console.error(`Device ${data.deviceId} is not online`);
            return;
          }
          if (device.inUse) {
            console.error(`Device ${data.deviceId} is already in use`);
            return;
          }
          await DBDevice.findByIdAndUpdate(data.deviceId, { inUse: true }, { new: true });
          await DBUserDeviceLinks.findByIdAndUpdate(userDeviceLink._id, { active: true }, { new: true });
          console.log(`Device ${data.deviceId} is now in use`);
          // Emit an event to the device to initiate WebRTC
          socket.to(deviceSocketMap.get(data.deviceId)).emit("initiate-webrtc", {
            userId,
          });
        });

        // Stop a WebRTC session with a device
        socket.on("stop-webrtc", async (data) => {
          console.log(`User ${userId} requested to stop a session with ${data.deviceId}`);
          const userDeviceLink = await DBUserDeviceLinks.findOne({ userId, deviceId: data.deviceId });
          if (!userDeviceLink) {
            console.error(`User ${userId} don't have permissions for device ${data.deviceId}`);
            return;
          }
          if (!userDeviceLink.active) {
            console.error(`User ${userId} haven't initiated a session with ${data.deviceId}`);
            return;
          }
          await DBDevice.findByIdAndUpdate(data.deviceId, { inUse: false }, { new: true });
          await DBUserDeviceLinks.findByIdAndUpdate(userDeviceLink._id, { active: false }, { new: true });
          console.log(`Device ${data.deviceId} is no longer in use`);
          socket.to(deviceSocketMap.get(data.deviceId)).emit("stop-webrtc", {
            userId});
        });

        // Forward the answer to device
        socket.on

      }else if(type === "device"){
        // Verify the token and get device ID and add it to the deviceSocketMap
        deviceSocketMap.set(deviceId, socket.id);
        console.log(`Device connected: ${deviceId}, Socket ID: ${socket.id}`);

        // Update the device status to online
        await DBDevice.findByIdAndUpdate(deviceId, { status: "online" }, { new: true })
        
        // On Disconnect, remove the device from the map
        socket.on("disconnect", async () => {
          console.log(`Device disconnected: ${deviceId}, Socket ID: ${socket.id}`);
          deviceSocketMap.delete(deviceId);
          // Update the device status to offline
          await DBDevice.findByIdAndUpdate(deviceId, { status: "offline" }, { new: true })
        });

        // Forward the WebRTC stop response to the user
        socket.on("stopped-webrtc", async (data) => {
          console.log(`Device ${deviceId} terminated WebRTC connection to user ${data.userId}`);
          const userSocketId = userSocketMap.get(data.userId);
          if (userSocketId) {
            io.to(userSocketId).emit("stop-webrtc", { deviceId });
          } else {
            console.error(`User ${data.userId} is not connected`);
          }
        });

        // Forward the WebRTC offer to the user
        socket.on("webrtc-offer", async (data) => {
          console.log(`Device ${deviceId} sent WebRTC offer to user ${data.userId}`);
          const userSocketId = userSocketMap.get(data.userId);
          if (userSocketId) {
            io.to(userSocketId).emit("webrtc-offer", {
              deviceId,
              sdp: data.sdp,
              type: data.type
            });
          } else {
            console.error(`User ${data.userId} is not connected`);
          }
        });

      }
      });
      
}
export default setupSocket;
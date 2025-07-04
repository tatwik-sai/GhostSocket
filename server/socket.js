import { Server } from "socket.io";
import { verifyToken } from "@clerk/backend";
import dotenv from "dotenv";
import DBDevice from "./models/DevicesModel.js";
import UserDeviceManager from "./utils/UserDeviceManager.js";
import DBUserDeviceLinks from "./models/UserDeviceLinksModel.js";
dotenv.config();
const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:3000",
            credentials: true
        }
    })

    const userDeviceManager = new UserDeviceManager();

    io.on("connection", async (socket) => {
      const {token, type, deviceId} = socket.handshake.auth;
      let isConnected = true;
      if(type === "user"){
        // Verify the token and get user ID and add it to the userSocketMap
        const decoded = await verifyToken(token, {secretKey: process.env.CLERK_SECRET_KEY});
        const userId = decoded.sub;
        
        userDeviceManager.addUserSocket(userId, socket.id);
        console.log(`User connected: ${userId}, Socket ID: ${socket.id}`);

        // On Disconnect, remove the user from the map
        socket.on("disconnect", async () => {
          isConnected = false;
          console.log(`User disconnected: ${userId}, Socket ID: ${socket.id}`);
          // correct this latter
          const devId = userDeviceManager.getDeviceIdByUserId(userId);
          if (devId) {
            io.to(userDeviceManager.getDeviceSocketIdByUserId(userId)).emit("stop-webrtc");
            userDeviceManager.deleteUserSocketAndConnection(userId);
            console.log("***********************************")
            await DBUserDeviceLinks.findOneAndUpdate({ userId, deviceId: devId }, { active: false })
            await DBDevice.findByIdAndUpdate(devId, { inUse: false })
            return;
          }
          userDeviceManager.deleteUserSocketOnly(userId);
        });

        // Start a WebRTC session with a device
        socket.on("initiate-webrtc", async (data) => {
          if (!isConnected) {
            console.log(`Ignoring initiate-webrtc from disconnected user ${userId}`);
            return;
          }
          console.log(`User ${userId} requested to start a session with ${data.deviceId}`);
          const device = await DBDevice.findById(data.deviceId);
          const userDeviceLink = await DBUserDeviceLinks.findOne({ userId, deviceId: data.deviceId });
          if (!userDeviceLink) {
            socket.emit("error", {message: `You dont have permissions for this device`});
            return;
          }
          if (device.status !== "online") {
            socket.emit("error", {message: `Device is not online`});
            return;
          }
          if (device.inUse) {
            socket.emit("error", {message: `Device is already in use`});
            return;
          }
          await DBDevice.findByIdAndUpdate(data.deviceId, { inUse: true });
          await DBUserDeviceLinks.findByIdAndUpdate(userDeviceLink._id, { active: true });
          console.log(`Device ${data.deviceId} is now in use`);
          userDeviceManager.addConnection(userId, data.deviceId);
          const deviceSocketId = userDeviceManager.getDeviceSocketIdByUserId(userId);
          // Emit an event to the device to initiate WebRTC
          socket.to(deviceSocketId).emit("initiate-webrtc");
        });

        // Stop a WebRTC session with a device
        socket.on("stop-webrtc", async () => {
          if (!isConnected) return;
          const devId = userDeviceManager.getDeviceIdByUserId(userId);
          const deviceSocketId = userDeviceManager.getDeviceSocketIdByUserId(userId);
          console.log(`User ${userId} requested to stop a session with ${devId}`);
          const userDeviceLink = await DBUserDeviceLinks.findOne({ userId, deviceId: devId });
          if (!userDeviceLink) {
            socket.emit("error", {message: `You dont have permissions for this device`});
            return;
          }
          if (!userDeviceLink.active) {
            socket.emit("error", {message: `You haven't initiated a session with this device`});
            return;
          }
          await DBDevice.findByIdAndUpdate(devId, { inUse: false });
          await DBUserDeviceLinks.findByIdAndUpdate(userDeviceLink._id, { active: false });
          console.log(`Device ${devId} is no longer in use`);
          socket.to(deviceSocketId).emit("stop-webrtc");
        });

        // Forward the answer to device
        socket.on("webrtc-answer", async (data) => {
          if (!isConnected) return;
          console.log(`User ${userId} sent WebRTC answer to device ${data.deviceId}`);
          const deviceSocketId = userDeviceManager.getDeviceSocketIdByUserId(userId);
          const devId = userDeviceManager.getDeviceIdByUserId(userId);
          if (deviceSocketId) {
            io.to(deviceSocketId).emit("webrtc-answer", {
              answer: data.answer
            });
          } else {
            socket.emit("error", {message: `Device is not online`});
          }
        });

        // Forward the ICE candidate to device
        socket.on("webrtc-ice-candidate", async (data) => {
          if (!isConnected) return;
          const devId = userDeviceManager.getDeviceIdByUserId(userId);
          const deviceSocketId = userDeviceManager.getDeviceSocketIdByUserId(userId);
          console.log(`User ${userId} sent WebRTC ICE candidate to device ${devId}`);
          if (deviceSocketId) {
            io.to(deviceSocketId).emit("webrtc-ice-candidate", {
              ice: data.ice
            });
          } else {
            socket.emit("error", {message: `Device is not online`});
          }
        });

        // Forward the message to device
        socket.on("to-device", async (data) => {
          if (!isConnected) return;
          const devId = userDeviceManager.getDeviceIdByUserId(userId);
          const deviceSocketId = userDeviceManager.getDeviceSocketIdByUserId(userId);
          console.log(`User ${userId} sent message to device ${devId}`);
          if (deviceSocketId) {
            io.to(deviceSocketId).emit("from-user", data);
          } else {
            socket.emit("error", {message: `Device is not online`});
          }
        });

      }else if(type === "device"){
        // Verify the token and get device ID and add it to the deviceSocketMap
        userDeviceManager.addDeviceSocket(deviceId, socket.id);
        console.log(`Device connected: ${deviceId}, Socket ID: ${socket.id}`);

        // Update the device status to online
        await DBDevice.findByIdAndUpdate(deviceId, { status: "online" }, { new: true })
        
        // On Disconnect, remove the device from the map
        socket.on("disconnect", async () => {
          console.log(`Device disconnected: ${deviceId}, Socket ID: ${socket.id}`);
          const uId = userDeviceManager.getUserIdByDeviceId(deviceId);
          const userSocketId = userDeviceManager.getUserSocketIdByDeviceId(deviceId);
          if (uId) {
            console.log(`Device ${deviceId} disconnected, notifying user ${uId}`);
            io.to(userSocketId).emit("stop-webrtc");
            userDeviceManager.deleteDeviceSocketAndConnection(deviceId);
          }

          await DBUserDeviceLinks.findOneAndUpdate({ userId: uId, deviceId }, { active: false })
          await DBDevice.findByIdAndUpdate(deviceId, { inUse: false })
          // Update the device status to offline
          await DBDevice.findByIdAndUpdate(deviceId, { status: "offline" }, { new: true })
        });

        // Forward the WebRTC stop response to the user
        socket.on("stopped-webrtc", async (data) => {
          const uId = userDeviceManager.getUserIdByDeviceId(deviceId);
          const userSocketId = userDeviceManager.getUserSocketIdByDeviceId(deviceId);
          console.log(`Device ${deviceId} terminated WebRTC connection to user ${uId}`);
          if (userSocketId) {
            io.to(userSocketId).emit("stopped-webrtc");
          } else {
            console.error(`User ${uId} is not connected`);
          }
        });

        // Forward the WebRTC offer to the user
        socket.on("webrtc-offer", async (data) => {
          const uId = userDeviceManager.getUserIdByDeviceId(deviceId);
          const userSocketId = userDeviceManager.getUserSocketIdByDeviceId(deviceId);
          console.log("***", uId, userSocketId)
          // console.log(`Device ${deviceId} sent WebRTC offer to user ${uId}`);
          if (userSocketId) {
            io.to(userSocketId).emit("webrtc-offer", {
              offer: data.offer
            });
            console.log(`Device ${deviceId} sent WebRTC offer to user ${uId}`);
          } else {
            console.error(`User ${uId} is not connected`);
          }
        });
        
        // Forward the ICE candidate to the user
        socket.on("webrtc-ice-candidate", async (data) => {
          const uId = userDeviceManager.getUserIdByDeviceId(deviceId);
          const userSocketId = userDeviceManager.getUserSocketIdByDeviceId(deviceId);
          console.log(`Device ${deviceId} sent WebRTC ICE candidate to user ${uId}`);
          if (userSocketId) {
            io.to(userSocketId).emit("webrtc-ice-candidate", {
              ice: data.ice
            });
          } else {
            console.error(`User ${uId} is not connected`);
          }
        });

        // Forward the message to the user
        socket.on("to-user", async (data) => {
          const uId = userDeviceManager.getUserIdByDeviceId(deviceId);
          const userSocketId = userDeviceManager.getUserSocketIdByDeviceId(deviceId);
          console.log(`Device ${deviceId} sent message to user ${uId}`);
          if (userSocketId) {
            io.to(userSocketId).emit("from-device", data);
          } else {
            console.error(`User ${uId} is not connected`);
          }
        });
      }
      });
      
}
export default setupSocket;
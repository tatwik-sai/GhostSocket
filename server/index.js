import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

let senderSocket = null;
let viewerSocket = null;

io.on("connection", (socket) => {
  socket.handshake.query.type === "sender" ? senderSocket = socket : viewerSocket = socket;
  console.log("🔌 Connected:", socket.id);

  socket.on("viewer", () => {
    viewerSocket = socket;
    console.log("👀 Viewer connected:", socket.id);
  });

  socket.on("start", () => {
    if (senderSocket) {
      console.log("▶️ Viewer requested stream start");
      senderSocket.emit("start");
    }
  });

  socket.on("stop", () => {
    if (senderSocket) {
      console.log("🔴 Viewer requested stream stop");
      senderSocket.emit("stop");
    }
  });
  
  socket.on("stopped-sending", () => {
    if (viewerSocket) {
      console.log("🔴 Sender stopped the stream");
      viewerSocket.emit("stopped-sending");
    }
  });

  socket.on("stop_screen", () => {
    if (senderSocket) {
      console.log("🔴 Viewer requested screen stop");
      senderSocket.emit("stop_screen");
    }
  });

  socket.on("screen_stopped", () => {
    if (viewerSocket) {
      console.log("🔴 Sender stopped the screen");
      viewerSocket.emit("screen_stopped");
    }
  });

  socket.on("resume_screen", () => {
    console.log("hi", senderSocket);
    if (senderSocket) {
          console.log("▶️ Viewer requested screen resume");
          senderSocket.emit("resume_screen");
      }
  });

  socket.on("screen_resumed", () => {
      if (viewerSocket) {
          console.log("��️ Screen resumed by sender");
          viewerSocket.emit("screen_resumed");
      }
  });

  socket.on("offer", (offer) => {
    senderSocket = socket;
    if (viewerSocket) viewerSocket.emit("offer", offer);
  });

  socket.on("answer", (answer) => {
    if (senderSocket) senderSocket.emit("answer", answer);
  });

  socket.on("ice", (data) => {
    const target = socket === senderSocket ? viewerSocket : senderSocket;
    if (target) target.emit("ice", data);
  });
});

server.listen(3000, () => {
  console.log("🚀 Signaling server on http://localhost:3000");
});

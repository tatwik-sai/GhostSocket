import { useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { useSocket } from "@/context/SocketContext";

export default function Viewer() {
  const videoRef = useRef(null);
  const socket = useSocket();
  const pc = useRef(null);

  const connectToServer = async () => {
    pc.current = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    pc.current.addTransceiver("video", { direction: "recvonly" });

    const offer = await pc.current.createOffer();
    await pc.current.setLocalDescription(offer);

    // ✅ Wait until ICE gathering is complete
    await new Promise((resolve) => {
      if (pc.current.iceGatheringState === "complete") {
        resolve();
      } else {
        const checkState = () => {
          if (pc.current.iceGatheringState === "complete") {
            pc.current.removeEventListener("icegatheringstatechange", checkState);
            resolve();
          }
        };
        pc.current.addEventListener("icegatheringstatechange", checkState);
      }
    });

    // ✅ Now send the completed SDP with bundled ICE
    socket.current.emit("rtc-offer", {
      sdp: pc.current.localDescription.sdp,
      type: pc.current.localDescription.type,
      userId: "user_2z3ZIFoH4iVg21CqsgbH8dSmaxM",
      deviceId: "desktop_001"
    });
    console.log("Sent offer");

    socket.current.on("answer", async (data) => {
      console.log("Received answer");
      await pc.current.setRemoteDescription(new RTCSessionDescription({sdp: data.sdp, type: data.type}));
    });

    // When remote media stream arrives
    pc.current.ontrack = (event) => {
      console.log("Track received", event.streams);
      if (videoRef.current && event.streams[0]) {
        videoRef.current.srcObject = event.streams[0];
        console.log(event.streams)
        videoRef.current.play().catch(e => console.error("Video play error:", e));
        console.log("Set srcObject on video element");
      } else {
        console.log("videoRef or event.streams[0] is missing");
      }
    };

    return () => {
      // Clean up on unmount
      if (pc.current) {
        pc.current.close();
      }
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Live Stream</h2>
      <Button onClick={connectToServer}>Connect</Button>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        controls={false}
        muted
        style={{ width: "100%", backgroundColor: "#000" }}
      />
    </div>
  );
}

"use client"
import React from 'react'
import { useParams } from 'next/navigation';

const Device = () => {
    const params = useParams();
    // const socket = 
    return (
      <div>
        {params.deviceId}
        <h1>Remote Screen Viewer</h1>
        <video id="remoteVideo"  autoplay playsinline controls style="width: 50%;"></video>
        <button id="stopScreenBtn" disabled>��️ Pause Screen Share</button>
        <button id="resumeScreenBtn" disabled>▶️ Resume Screen Share</button>
        <video id="remoteWebcam" autoplay playsinline controls style="width: 50%;"></video>
        <audio id="mic_audio" autoplay controls playsinline></audio>
        <pre id="log" style="background: #eee; padding: 10px;"></pre>

        <br />
        <button id="connectBtn">🔌 Connect to Stream</button>
      </div>
    );
};

export default Device;
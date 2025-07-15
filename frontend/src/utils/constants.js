export const HOST = process.env.NEXT_PUBLIC_SERVER_URL;


export const permissionDesriptions ={
    remoteControl: {
        shortDescription: "Remote Control Access",
        longDescription: "Access the complete device remotely, control mouse, keyboard, and actions"
    },
    screenShare: {
        shortDescription: "Live screen view",
        longDescription: "Watch the devices screen in real-time"
    },
    terminalAccess: {
        shortDescription: "Terminal access",
        longDescription: "Access and execute commands in the terminal remotely"
    },
    fileAccess: {
        shortDescription: "File system access",
        longDescription: "View and manage files on the device"
    },
    webcamFeed: {
        shortDescription: "Webcam access",
        longDescription: "View and stream this device's webcam feed"
    },
    resourceMonitor: {
        shortDescription: "Monitor system stats",
        longDescription: "Check and monitor CPU, memory, and active processes real-time"
    }
};
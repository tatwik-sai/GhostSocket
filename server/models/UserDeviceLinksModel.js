import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid';


export const permissionsSchema = new mongoose.Schema({
    remoteControl: {
        allowed: { type: Boolean, default: false },
        shortDescription: { type: String, default: "Remote Control Access" },
        longDescription: { type: String, default: "Access the complete device remotely, control mouse, keyboard, and actions" }
    },
    screenShare: {
        allowed: { type: Boolean, default: false },
        shortDescription: { type: String, default: "Live screen view" },
        longDescription: { type: String, default: "Watch the devices screen in real-time" }
    },
    terminalAccess: {
        allowed: { type: Boolean, default: false },
        shortDescription: { type: String, default: "Terminal access" },
        longDescription: { type: String, default: "Access and execute commands in the terminal remotely" }
    },
    fileAccess: {
        allowed: { type: Boolean, default: false },
        shortDescription: { type: String, default: "File system access" },
        longDescription: { type: String, default: "View and manage files on the device" }
    },
    webcamFeed: {
        allowed: { type: Boolean, default: false },
        shortDescription: { type: String, default: "Webcam access" },
        longDescription: { type: String, default: "View and stream this device's webcam feed" }
    },
    resourceMonitor: {
        allowed: { type: Boolean, default: false },
        shortDescription: { type: String, default: "Monitor system stats" },
        longDescription: { type: String, default: "Check and monitor CPU, memory, and active processes real-time" }
    }
}, { _id: false });

const userDeviceLinksSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: [true,"ID is required"],
        unique: true,
        default: uuidv4,
    },
    userId: {
        type: String,
        required: [true,"user id is required"],
    },
    deviceId: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        default: "Unnamed Device",
    },
    role: {
        type: String,
        default: "user",
    },
    active: {
        type: Boolean,
        default: false,
    },
    permissions: {
        type: permissionsSchema,
        default: () => ({}),
    },
    sessionKey: {
        type: String,
        required: false,
        default: null,
    },
    expiry: {
        type: Date,
        default: null,
        validate: {
            validator: function(value) {
                return value === null || value instanceof Date;
            },
            message: 'Expiry must be a valid date or null for never'
        }
    },
}, { timestamps: true });

const DBUserDeviceLinks = mongoose.model("user_device_links", userDeviceLinksSchema);
export default DBUserDeviceLinks;
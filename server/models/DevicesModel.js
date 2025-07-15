import mongoose from "mongoose";

const deviceDataSchema = new mongoose.Schema({
    os: {
        type: String,
        default: "unknown",
    },
    ip: {
        type: String,
        default: "unknown",
    },
    location: {
        type: String,
        default: "unknown",
    },
    cpu: {
        type: String,
        default: "unknown",
    },
    username: {
        type: String,
        default: "unknown",
    },
    hostname: {
        type: String,
        default: "unknown",
    },
    architecture: {
        type: String,
        default: "unknown",
    },
    role: {
        type: String,
        default: "unknown",
    },
}, { _id: false, timestamps: true });

  
const deviceSchema = new mongoose.Schema({
    _id: {
        type: String,
    },
    status: {
        type: String,
        default: "offline",
    },
    inUse:{
        type: Boolean,
        default: false,
    },
    deviceData: deviceDataSchema,
    
}, { timestamps: true });

const DBDevice = mongoose.model("Devices", deviceSchema);
export default DBDevice;    
import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid';


export const permissionsSchema = new mongoose.Schema({
    canControl: {
        type: Boolean,
        default: false,
        description: "Can control the device",
    },
    canView: {
        type: Boolean,
        default: false,
        description: "Can view the device",
    }
}, { _id: false, });

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
        unique: true,
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
    permissions: {
        type: permissionsSchema,
        default: () => ({ canControl: false, canView: false }),
    }
}, { timestamps: true });

const DBUserDeviceLinks = mongoose.model("user_device_links", userDeviceLinksSchema);
export default DBUserDeviceLinks;
import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
    _id: { // Id acts as session key
        type: String,
        required: true,
        default: () => new mongoose.Types.ObjectId().toString(),
    },
    deviceId: { // The device for which the session is created
        type: String,
        required: true,
    },
    userId: { // The user who created the session
        type: String,
        required: true,
    },  
    joinedUserId: { // The user who joined the session, if any
        type: String,
        required: false,
        default : null,
    },
    accessedDate: { // The date when the session was created
        type: Date,
        default: null,
        required: false,
    },
    terminated: { // If the session is terminated
        type: Boolean,
        default: false,
    },
    expiry: {  // After this expiry the session key becomes invalid and any existing session ends
        type: Date,
        required: false,
        default: null,
    },
    permissions: { // Permissions granted for the session
        type: Array,
        required: true,
    }
}, { timestamps: true });

const DBSessions = mongoose.model("Sessions", sessionSchema);
export default DBSessions;
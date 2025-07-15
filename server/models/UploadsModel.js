import mongoose from "mongoose";

const uploadsSchema = new mongoose.Schema({
    imageId: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    deviceId: {
        type: String,
        required: true,
    },
    type: {
        type: String,
    }
}, { timestamps: true });

const DBUploads = mongoose.model("Uploads", uploadsSchema);
export default DBUploads;
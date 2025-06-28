import mongoose from "mongoose";
    
const otpSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => `otp_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
    },
    userId: {
        type: String,
        required: [true,"User ID is required"],
    },
    email: {
        type: String,
        required: [true,"Email is required"],
    },
    otp: {
        type: String,
    },
    expiresAt: {
        type: Date,
        default: Date.now + 5 * 60 * 1000,
    },
    
    
})

const DBOTP = mongoose.model("OTP", otpSchema);
export default DBOTP 
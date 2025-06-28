import mongoose from "mongoose";
// {
//     permissions: [
//       { userId: "other_user_id", canControl: true, canView: true }
//     ]
//   }
  
const deviceSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => `device_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
    },
    userId: {
        type: String,
        required: [true,"User ID is required"],
    },
    name: {
        type: String,
        required: false,
    },
    status: {
        type: String,
        default: "offline",
    },
    permissions: {
        type: Array,
        default: [],
    },
    
})

const DBDevice = mongoose.model("Devices", deviceSchema);
export default DBDevice 
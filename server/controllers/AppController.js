import dotenv from "dotenv";
import nodemailer from 'nodemailer';
import DBOTP from '../models/OtpModel.js';
import DBDevice from '../models/DevicesModel.js';
import DBUserDeviceLinks, { permissionsSchema } from '../models/UserDeviceLinksModel.js';
import { clerkClient } from '../utils/ClerkClient.js'
import DBUser from "../models/UserModel.js";
import DBSessions from "../models/SessionModel.js";


dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  }
});

export const checkUser = async (req, res) => {
  try {
    const { email } = req.body;

    const users = await clerkClient.users.getUserList({ emailAddress: [email] });
    if (users.length === 0 || !users.data || !users.data[0]) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users.data[0];
    const userData = await clerkClient.users.getUser(user.id);
    const externalAccounts = userData.externalAccounts;

    const hasGoogleAuth = externalAccounts.some(
      (account) => account.provider === "oauth_google"
    );

    if (hasGoogleAuth) {
      const otp = await sendOtp(email, user.id);
      if (otp.success) {
        return res.status(200).json({ type: "otp", oauth: "google" });
      } else {
        return res.status(500).json({ message: "Error sending OTP" });
      }
    } else {
      console.log("email_password")
      return res.status(200).json({ type: "email_password" });
    }
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export async function resendOtp(req, res) {
  try {
    const { email } = req.body;
    const users = await clerkClient.users.getUserList({ emailAddress: [email] });
    if (users.length === 0 || !users.data || !users.data[0]) {
      return res.status(404).json({ message: "User not found" });
    }
    const userId = users.data[0].id;
    const otp = await sendOtp(email, userId);
    if (otp.success) {
      return res.status(200).json({ message: "Resent OTP!" });
    } else {
      return res.status(500).json({ message: "Error sending OTP" });
    }
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function sendOtp(email, userId) {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'GhostSocket OTP Code',
    text: `Your OTP code is: ${otp}. It will expire in 5 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
    await DBOTP.create({ email, otp, expiresAt: Date.now() + 5 * 60 * 1000 , userId});
    return { success: true};
  } catch (err) {
    console.error('Error sending OTP:', err);
    return { success: false };
  }
}

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp, deviceId } = req.body;

    // Check if the otp is correct and not expired
    const otpData = await DBOTP.findOne({ email, otp });
    if (!otpData) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (otpData.expiresAt < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }
    await DBOTP.deleteOne({ email, otp });

    // Check if the device id is already in the database
    const device = await DBDevice.findOne({ _id: deviceId });
    if (device) {
      // Check if a link exists for the device with the role of owner. If not, create a new link
      const userDeviceLink = await DBUserDeviceLinks.findOne({ deviceId , role: "owner"});
      if(userDeviceLink) {
        return res.status(400).json({ message: "Device is already logged in." });
      }
      await DBUserDeviceLinks.create({
        deviceId,
        userId: otpData.userId,
        role: "owner"
      });
      return res.status(200).json({ message: "OTP verified"});
    } 
    // Create a new device in the database and a new link for the user
    await DBDevice.create({_id: deviceId, status: "online"});
    await DBUserDeviceLinks.create({
      deviceId,
      userId: otpData.userId,
      role: "owner"
    });
    return res.status(200).json({ message: "OTP verified"});
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyPassword = async (req, res) => {
  try {
    const { email, password, deviceId } = req.body;
    const users = await clerkClient.users.getUserList({ emailAddress: [email] });
    if (users.length === 0 || !users.data || !users.data[0]) {
      return res.status(404).json({ message: "User not found" });
    }
    const userId = users.data[0].id;
    const response = await clerkClient.users.verifyPassword({
      userId,
      password,
    })
    if (response.verified) {
      // Check if the device id is already in the database
      const device = await DBDevice.findOne({ _id: deviceId });
      if (device) {
        // Check if a link exists for the device with the role of owner. If not, create a new link
        const userDeviceLink = await DBUserDeviceLinks.findOne({ deviceId , role: "owner"});
        if(userDeviceLink) {
          return res.status(400).json({ message: "Device is already logged in." });
        }
        await DBUserDeviceLinks.create({
          deviceId,
          userId: userId,
          role: "owner"
        });
        return res.status(200).json({ message: "OTP verified"});
      } 
      // Create a new device in the database and a new link for the user
      await DBDevice.create({_id: deviceId, status: "online"});
      await DBUserDeviceLinks.create({
        deviceId,
        userId,
        role: "owner"
      });
      return res.status(200).json({ message: "OTP verified"});

    } else {
        return res.status(400).json({ message: "Invalid password" });
    }
  } catch (err) {
    console.error('Error:', err);
    if (err.errors[0].code === "incorrect_password") {
      return res.status(400).json({ message: "Incorrect password" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserData = async (req, res) => {
  // This function fetches the owner data associated with a device
  try {
    const { deviceId } = req.body;
    const device = await DBDevice.findOne({ _id: deviceId });
    if (!device) {
      return res.status(404).json({ type: "deleted" , message: "Device not found" });
    }
    const userDeviceLink = await DBUserDeviceLinks.findOne({ deviceId, role: "owner" });
    if(!userDeviceLink) {
      return res.status(400).json({ message: "Device isn't logged in" });
    }
    const user = await DBUser.findById(userDeviceLink.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const sortedPermissions = Object.fromEntries(Object.entries(userDeviceLink.permissions.toObject()).sort(([permission1, val1], [permission2, val2]) => {
      if (permission1 === "remoteControl") return -10;
      if (permission2 === "remoteControl") return 10;
      if (val1.allowed) return -1;
      if (val2.allowed) return 1;
      return 0;
    }))

    return res.status(200).json({ message: "User data fetched", data: {
      name: (!user.firstName && !user.lastName) ? user.email : (user.firstName || "") + " " + (user.lastName || ""),
      email: user.email,
      profileImage: user.imageUrl,
      permissions: sortedPermissions,
    } });
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export const savePermissions = async (req, res) => {
  try {
    const { deviceId, permissions } = req.body;
    const device = await DBDevice.findOne({ _id: deviceId });
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }
    const userDeviceLink = await DBUserDeviceLinks.findOne({ deviceId, role: "owner" });
    if(!userDeviceLink) {
      return res.status(400).json({ message: "Login as owner to modify permissions" });
    }
    console.log("Permissions to save:", permissions);
    
    const currentPermissions = userDeviceLink.permissions?.toObject?.() || userDeviceLink.permissions || {};
    
    for (const [permission, value] of Object.entries(permissions)) {
        currentPermissions[permission].allowed = value;
    }
    
    console.log("Updated permissions:", currentPermissions);
    
    await DBUserDeviceLinks.findByIdAndUpdate(userDeviceLink._id, { 
      permissions: currentPermissions 
    });

    const userLinks = await DBUserDeviceLinks.find({ deviceId, role: "user" });
    for (const userLink of userLinks) {
      const userPermissions = userLink.permissions?.toObject?.() || userLink.permissions || {};
      
      for (const [permission, value] of Object.entries(userPermissions)) {
        userPermissions[permission].allowed = 
          value.allowed && currentPermissions[permission].allowed;
      }
      
      await DBUserDeviceLinks.findByIdAndUpdate(userLink._id, { permissions: userPermissions });
    }

    const deviceSessions = await DBSessions.find({ 
                            deviceId, 
                            terminated: false, 
                            $or: [
                              { expiry: { $gt: new Date() } },
                              { expiry: { $eq: null } }
                            ]
                          });
    console.log("Device sessions:", deviceSessions);
    for (const session of deviceSessions) {
      const sessionPermissions = session.permissions;
      
      for (let i = 0; i < sessionPermissions.length; i++) {
        const permission = sessionPermissions[i];
        const [key, value] = Object.entries(permission)[0];
        
        sessionPermissions[i] = { 
          [key]: value && currentPermissions[key].allowed 
        };
      }
      
      await DBSessions.findByIdAndUpdate(session._id, { 
        permissions: sessionPermissions 
      });
    }

    return res.status(200).json({ message: "Permissions saved" });
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export const enableDisable = async (req, res) => {
  try {
    const { deviceId, linked } = req.body;
    await DBDevice.findByIdAndUpdate(deviceId, {linked});
    return res.status(200).json({ message: linked ? "Enabled Control" : "Disabled Control" });
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export const updateDeviceInfo = async (req, res) => {
  try {
    const { deviceId, deviceInfo } = req.body;
    await DBDevice.findByIdAndUpdate(deviceId, {deviceData: deviceInfo})
    return res.status(200).json({ message: "Device info updated" });
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export const logoutApp = async (req, res) => {
  try {
    const { deviceId} = req.body;
    const device = await DBDevice.findOne({ _id: deviceId });
    if (device) {
      const userDeviceLink = await DBUserDeviceLinks.findOne({ deviceId, role: "owner" });
      if (!userDeviceLink) {
        return res.status(400).json({ message: "Device is not logged in" });
      }
      await DBUserDeviceLinks.deleteMany({ deviceId });
      return res.status(200).json({ message: "Device logged out" });
    }
    return res.status(404).json({ message: "Device not found" });
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
import { verifyWebhook } from '@clerk/express/webhooks' 
import DBUser from '../models/UserModel.js'
import axios from "axios";
import { clerkClient } from '../utils/ClerkClient.js'
import dotenv from "dotenv";
import nodemailer from 'nodemailer';
import DBOTP from '../models/OtpModel.js';
import DBDevice from '../models/DevicesModel.js';

dotenv.config();

export const onSignup = async (req, res) => {
    try {
      const evt = await verifyWebhook(req)
  

      const { id, email_addresses, first_name, last_name, image_url } = evt.data
      const eventType = evt.type
      if(eventType === "user.created") {
        await DBUser.create({
            _id: id,
            email: email_addresses[0].email_address,
            firstName: first_name,
            lastName: last_name,
            imageUrl: image_url,
        })
    } else if(eventType === "user.updated") {
        await DBUser.findByIdAndUpdate(id, {
            firstName: first_name,
            lastName: last_name,
            imageUrl: image_url,
        })
    } else if(eventType === "user.deleted") {
        await DBUser.findByIdAndDelete(id)
    }
      return res.status(201).send('New user created')
    } catch (err) {
      console.error('Error:', err)
      return res.status(400).send('Error in onSignup')
    }
}


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

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpData = await DBOTP.findOne({ email, otp });
    if (!otpData) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (otpData.expiresAt < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }
    await DBOTP.deleteOne({ email, otp });
    
    // Create a new device in the database and send the device id
    const device = await DBDevice.create({
      userId: otpData.userId,
      name: "New Device",
      status: "online",
      permissions: [],
    });
    // add the device id to the user's myDevices array
    await DBUser.findByIdAndUpdate(otpData.userId, { $push: { myDevices: device._id } });
    return res.status(200).json({ message: "OTP verified", deviceId: device._id });
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = await clerkClient.users.getUserList({ emailAddress: [email] });
    if (users.length === 0 || !users.data || !users.data[0]) {
      return res.status(404).json({ message: "User not found" });
    }
    const userId = users.data[0].id;
    const response = await clerkClient.users.verifyPassword({
      userId,
      password,
    })
    console.log("response", response)
    if (response.verified) {
      const device = await DBDevice.create({
        userId: userId,
        name: "New Device",
        status: "online",
        permissions: [],
      });
      return res.status(200).json({ message: "Login successful!", deviceId: device._id });
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

import express from "express";
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { ClerkExpressRequireAuth} from "@clerk/clerk-sdk-node";
import clerkRoutes from "./routes/ClerkRoutes.js";
import appRoutes from "./routes/AppRoutes.js";
import {setupSocket} from "./socket.js";
import { clerkClient } from "./utils/ClerkClient.js";
import deviceRoutes from "./routes/DeviceRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import sessionRoutes from "./routes/SessionRoutes.js";


dotenv.config()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()
const port = process.env.port || 3001;
const databaseURL = process.env.DATABASE_URL;

app.use(cors({
    origin: "*",
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
}))
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/clerk", clerkRoutes) 

app.use(cookieParser());
app.use(express.json());

app.use("/app", appRoutes)
app.use("/devices", deviceRoutes)
app.use("/sessions", sessionRoutes)

app.get("/protected", ClerkExpressRequireAuth(), async (req, res) => {
    const { userId } = req.auth;
    const user = await clerkClient.users.getUser(userId);
    console.log(user._raw.object)
    res.json({
      message: "You are authenticated",
      userId: userId,
      // email: user.primaryEmailAddress.emailAddress,
    });
  });

const server = app.listen(port, () => {
    console.log(`Server is running at: http://localhost:${port}`)
});

setupSocket(server);
mongoose.connect(databaseURL).then(() => console.log("DB Connection Sucessful")).catch((err) => console.log(`Error: ${err}`))
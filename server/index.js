import express from "express";
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import clerkRoutes from "./routes/ClerkRoutes.js";
import appRoutes from "./routes/AppRoutes.js";
import {setupSocket} from "./socket.js";
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
    origin: process.env.ORIGIN,
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

const server = app.listen(port, () => {
    console.log(`Server is running at: http://localhost:${port}`)
});

setupSocket(server);
mongoose.connect(databaseURL).then(() => console.log("DB Connection Sucessful")).catch((err) => console.log(`Error: ${err}`))
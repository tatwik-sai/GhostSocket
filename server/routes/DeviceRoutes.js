import { Router } from "express";
import { getMyDevices, getOtherDevices } from "../controllers/DeviceController.js";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";

const deviceRoutes = Router()

deviceRoutes.get("/my", ClerkExpressRequireAuth(), getMyDevices);
deviceRoutes.get("/other", ClerkExpressRequireAuth(), getOtherDevices);

export default deviceRoutes;
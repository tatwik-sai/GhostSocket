import { Router } from "express";
import { getMyDevices, getOtherDevices, updateName} from "../controllers/DeviceController.js";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import DBUserDeviceLinks from "../models/UserDeviceLinksModel.js";

const deviceRoutes = Router()

deviceRoutes.get("/my", ClerkExpressRequireAuth(), getMyDevices);
deviceRoutes.get("/other", ClerkExpressRequireAuth(), getOtherDevices);
deviceRoutes.put("/:linkId/name", updateName);

export default deviceRoutes;
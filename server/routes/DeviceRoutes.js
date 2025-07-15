import { Router } from "express";
import { getDeviceInfo, getMyDevices, getOtherDevices, updateName, uplodFile, getUploads, deleteDevice} from "../controllers/DeviceController.js";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import multer from "multer";


const deviceRoutes = Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./uploads"),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage }); 

deviceRoutes.get("/my", ClerkExpressRequireAuth(), getMyDevices);
deviceRoutes.get("/other", ClerkExpressRequireAuth(), getOtherDevices);
deviceRoutes.get("/:deviceId", ClerkExpressRequireAuth(), getDeviceInfo);
deviceRoutes.get("/:deviceId/get-uploads", ClerkExpressRequireAuth(), getUploads);

deviceRoutes.post("/:deviceId/uploads", ClerkExpressRequireAuth(), upload.single("snapshot"), uplodFile)

deviceRoutes.put("/:linkId/name", updateName);

deviceRoutes.delete("/:deviceId", ClerkExpressRequireAuth(), deleteDevice);

export default deviceRoutes;
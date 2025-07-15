import { Router } from "express";
import {checkUser, resendOtp, verifyOtp, verifyPassword, logoutApp,
     getUserData, savePermissions, enableDisable, updateDeviceInfo} from "../controllers/AppController.js"

const appRoutes = Router()


appRoutes.post("/get-user-data", getUserData)
appRoutes.post("/check-user", checkUser)
appRoutes.post("/verify-otp", verifyOtp)
appRoutes.post("/verify-password", verifyPassword)
appRoutes.post("/resend-otp", resendOtp)
appRoutes.post("/logout-app", logoutApp)
appRoutes.post("/save-permissions", savePermissions)
appRoutes.post("/enable-disable", enableDisable)
appRoutes.post("/update-device-info", updateDeviceInfo)

export default appRoutes;
import { Router } from "express";
import {checkUser, resendOtp, verifyOtp, verifyPassword, logoutApp, getUserData, savePermissions, enableDisable} from "../controllers/AppController.js"

const appRoutes = Router()

appRoutes.post("/check-user", checkUser)
appRoutes.post("/verify-otp", verifyOtp)
appRoutes.post("/verify-password", verifyPassword)
appRoutes.post("/resend-otp", resendOtp)
appRoutes.post("/logout-app", logoutApp)
appRoutes.post("/get-user-data", getUserData)
appRoutes.post("/save-permissions", savePermissions)
appRoutes.post("/enable-disable", enableDisable)

export default appRoutes;
import { Router } from "express";
import {checkUser, onSignup, resendOtp, verifyOtp, verifyPassword} from "../controllers/ClerkController.js"
import { raw } from "express";

const clerkRoutes = Router()

clerkRoutes.post("/on-signup", raw({ type: 'application/json' }), onSignup)
clerkRoutes.post("/check-user", checkUser)
clerkRoutes.post("/verify-otp", verifyOtp)
clerkRoutes.post("/verify-password", verifyPassword)
clerkRoutes.post("/resend-otp", resendOtp)

export default clerkRoutes;
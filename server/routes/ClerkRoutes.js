import { Router } from "express";
import {onSignup} from "../controllers/ClerkController.js"
import { raw } from "express";

const clerkRoutes = Router()

clerkRoutes.post("/on-signup", raw({ type: 'application/json' }), onSignup)

export default clerkRoutes;
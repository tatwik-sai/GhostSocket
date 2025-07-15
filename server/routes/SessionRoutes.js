import { Router } from "express";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import { createSession, joinSession, getSessions, connectedSessions, terminateSession, updatePermissions} from "../controllers/SessionController.js";


const sessionRoutes = Router()

sessionRoutes.post("/create", ClerkExpressRequireAuth(), createSession)
sessionRoutes.post("/join", ClerkExpressRequireAuth(), joinSession);
sessionRoutes.get("/get-sessions", ClerkExpressRequireAuth(), getSessions);
sessionRoutes.get("/connected-sessions/:deviceId", ClerkExpressRequireAuth(), connectedSessions);
sessionRoutes.put("/update-permissions", ClerkExpressRequireAuth(), updatePermissions)
sessionRoutes.delete("/:sessionKey", ClerkExpressRequireAuth(), terminateSession);

export default sessionRoutes;
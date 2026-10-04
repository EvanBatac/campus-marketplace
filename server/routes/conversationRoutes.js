import express from "express";
import authenticate from "../middleware/authMiddleware.js";
import { startConversation } from "../controllers/conversationController.js";
const router = express.Router();

router.post("/", authenticate, startConversation);

export default router;

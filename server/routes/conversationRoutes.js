import express from "express";
import authenticate from "../middleware/authMiddleware.js";
import {
  startConversation,
  getMessages,
} from "../controllers/conversationController.js";
const router = express.Router();

router.post("/", authenticate, startConversation);
router.get("/:id/messages", authenticate, getMessages);

export default router;

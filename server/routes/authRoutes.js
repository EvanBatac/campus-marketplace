import express from "express";
import { register, login, getMe } from "../controllers/authController.js";
import authenticate from "../middleware/authMiddleware.js";
import { updateProfile, changePassword } from "../controllers/settingsController.js";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, getMe);
router.patch("/me", authenticate, updateProfile);
router.patch("/password", authenticate, changePassword);
export default router;

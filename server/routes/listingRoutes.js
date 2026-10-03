import express from "express";
import { createListing } from "../controllers/listingController.js";
import authenticate from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/", authenticate, createListing);

export default router;

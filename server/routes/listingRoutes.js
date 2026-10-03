import express from "express";
import {
  createListing,
  getListings,
} from "../controllers/listingController.js";
import authenticate from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/", authenticate, createListing);
router.get("/", getListings);

export default router;

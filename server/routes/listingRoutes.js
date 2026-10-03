import express from "express";
import {
  createListing,
  getListings,
  getListingById,
  updateListing,
} from "../controllers/listingController.js";
import authenticate from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/", authenticate, createListing);
router.get("/", getListings);
router.get("/:id", getListingById);
router.put("/:id", authenticate, updateListing);

export default router;

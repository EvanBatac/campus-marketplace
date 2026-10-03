import express from "express";
import {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing,
} from "../controllers/listingController.js";
import authenticate from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/", authenticate, createListing);
router.get("/", getListings);
router.get("/:id", getListingById);
router.put("/:id", authenticate, updateListing);
router.delete("/:id", authenticate, deleteListing);

export default router;

import express from "express";
import {
  getUsers,
  updateProfile,
  getMediaSharingDetails,
} from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getUsers);
router.put("/profile", authMiddleware, updateProfile);
router.get("/media-sharing", authMiddleware, getMediaSharingDetails);

export default router;

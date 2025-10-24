import express from "express";
import { 
    registerUser, 
    loginUser, 
    getUserProfile, 
    updateUserProfile, 
    changePassword, 
    verifyToken 
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.get("/verify", protect, verifyToken);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.put("/change-password", protect, changePassword);

export default router;
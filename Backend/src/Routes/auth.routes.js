import express from "express";
import AuthController from "../Controllers/user.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";


const router = express.Router();

const controller = AuthController();

// Public routes
router.post("/register", controller.RegisterUser)
router.post("/login", controller.LoginUser)
router.post("/refresh-token", controller.RefreshToken)

// Protected routes
router.post("/logout", authMiddleware, controller.LogoutUser)
router.get("/me", authMiddleware, controller.GetCurrentUser)
router.get("/users", authMiddleware, controller.ListUsers)

// Legacy routes (keep for backward compatibility)
router.get("/getuser/:id", controller.getUser)
router.put("/changename/:id", controller.ChangeName)
router.put("/changepassword/:id", controller.ChangePassword)


export default router;

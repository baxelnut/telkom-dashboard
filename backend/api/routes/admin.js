import express from "express";
import {
  getAdminInfo,
  getAllAdmins,
  getAllUsers,
  updateUserRole,
  registerNewUser,
  getUserByEmail,
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/users", getAllUsers);
router.get("/user-info", getUserByEmail);
router.get("/all-admins", getAllAdmins);
router.get("/admin-info/:userId", getAdminInfo);
router.patch("/set-role", updateUserRole);
router.post("/register", registerNewUser);

export default router;

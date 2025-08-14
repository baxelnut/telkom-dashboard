import express from "express";
import {
  getAdminInfo,
  getAllAdmins,
  getAllUsers,
  updateUserRole,
  registerNewUser,
  getUserByEmail,
  getUserByUid,
  updateUserByUid,
  deleteUserByUid,
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/users", getAllUsers);
router.delete("/users/:uid", deleteUserByUid);

router.get("/user-info/by-email", getUserByEmail);
router.get("/user-info/by-uid", getUserByUid);
router.put("/user-info/update/:uid", updateUserByUid);

router.get("/all-admins", getAllAdmins);
router.get("/admin-info/:userId", getAdminInfo);

router.patch("/set-role", updateUserRole);
router.post("/register", registerNewUser);

export default router;

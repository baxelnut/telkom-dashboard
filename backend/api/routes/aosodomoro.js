import express from "express";
import {
  getAllAosodomoro,
  getReg3Aosodomoro,
} from "../controllers/aosodomoroController.js";

const router = express.Router();

router.get("/", getAllAosodomoro);
router.get("/reg_3", getReg3Aosodomoro);

export default router;

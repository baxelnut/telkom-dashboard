import express from "express";
import {
  getAllAosodomoro,
  getReg3OrderSubtype,
  getReg3SubSegmen,
  getReg3Segmen,
  getAosodomoroSegmen,
  getReg3Kategori,
  // getReg3Progress,
} from "../controllers/aosodomoroController.js";
import { getAosodomoroSheet } from "../controllers/sheetsController.js";

const router = express.Router();

router.get("/", getAllAosodomoro);
router.get("/reg_3_subtypes", getReg3OrderSubtype);
router.get("/reg_3_subsegmen", getReg3SubSegmen);
router.get("/reg_3_segmen", getReg3Segmen);
router.get("/aosodomoro_reg_3_segmen", getAosodomoroSegmen);
router.get("/reg_3_kategori", getReg3Kategori);
// router.get("/reg_3_progress", getReg3Progress);
router.get("/sheets", getAosodomoroSheet);

export default router;

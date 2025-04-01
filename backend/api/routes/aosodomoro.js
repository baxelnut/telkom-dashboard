import express from "express";
import {
  getAllAosodomoro,
  getReg3Status,
  getReg3OrderSubtype,
  getReg3SubSegmen,
  getReg3Segmen,
} from "../controllers/aosodomoroController.js";

const router = express.Router();

router.get("/", getAllAosodomoro);
router.get("/reg_3_status", getReg3Status);
router.get("/reg_3_subtypes", getReg3OrderSubtype);
router.get("/reg_3_subsegmen", getReg3SubSegmen);
router.get("/reg_3_segmen", getReg3Segmen);

export default router;

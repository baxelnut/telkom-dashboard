import express from "express";
import {
  getAllAosodomoro,
  getReg3Status,
  getReg3OrderSubtype,
  getReg3SubSegmen,
} from "../controllers/aosodomoroController.js";

const router = express.Router();

router.get("/", getAllAosodomoro);
router.get("/reg_3_status", getReg3Status);
router.get("/reg_3_subtypes", getReg3OrderSubtype);
router.get("/reg_3_subsegmen", getReg3SubSegmen);

export default router;

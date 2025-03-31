import express from "express";
import {
  getAllAosodomoro,
  getReg3Status,
  getReg3OrderSubtype,
} from "../controllers/aosodomoroController.js";

const router = express.Router();

router.get("/", getAllAosodomoro);
router.get("/reg_3_status", getReg3Status);
router.get("/reg_3_subtypes", getReg3OrderSubtype);

export default router;

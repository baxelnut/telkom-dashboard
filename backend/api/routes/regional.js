import express from "express";
import {
  getAllRegional3Data,
  getReg3ReportData,
  updateReg3Data,
} from "../controllers/regional3Controller.js";

const router = express.Router();

router.get("/", getAllRegional3Data);
router.get("/report", getReg3ReportData);
router.patch("/:id", updateReg3Data);

export default router;

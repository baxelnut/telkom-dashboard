import express from "express";
import {
  getAllRegional3Data,
  getReg3ReportData,
  updateReg3Data,
  getReg3Status,
  getReg3InProcessData,
} from "../controllers/regional3Controller.js";

const router = express.Router();

router.get("/", getAllRegional3Data);
router.get("/report", getReg3ReportData);
router.get("/report/in_process", getReg3InProcessData);
router.get("/progress_status", getReg3Status);
router.patch("/:id", updateReg3Data);

export default router;

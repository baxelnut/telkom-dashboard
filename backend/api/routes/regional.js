import express from "express";
import {
  getAllRegional3Data,
  getReg3ReportData,
} from "../controllers/regional3Controller.js";

const router = express.Router();

router.get("/", getAllRegional3Data);
router.get("/report", getReg3ReportData);

export default router;

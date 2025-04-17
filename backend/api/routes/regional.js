import express from "express";
import {
  getAllRegional3Data,
  getReg3ReportData,
  updateReg3Data,
  getReg3Status,
  getReg3InProcessData,
  getReg3ProgressOst,
} from "../controllers/regional3Controller.js";
import { injectUUID, updateSheet } from "../controllers/sheetsController.js";

const router = express.Router();

router.get("/", getAllRegional3Data);
router.get("/report", getReg3ReportData);
router.get("/report/in_process", getReg3InProcessData);
router.get("/progress_status", getReg3Status);
router.get("/report/order_sub_type", getReg3ProgressOst);
router.patch("/:id", updateReg3Data);

router.patch("/sheet/:id", updateSheet);
router.get("/inject_uuid", injectUUID);

export default router;

import express from "express";
import {
  getReg3ReportData,
  getReg3InProcessData,
} from "../controllers/regional3Controller.js";
import {
  processStatus,
  updateSheet,
  getOrderSubtypeRev,
  getSheetSegmen,
  getSheetOrderType2,
  getSheetOrderSimplified,
  getSheetKategoriSimplified,
  getPO,
  getSegmenSubtype2,
  getSegmenSubtype2Rev,
} from "../controllers/sheetsController.js";

const router = express.Router();

router.get("/report", getReg3ReportData);
router.get("/report/in-process", getReg3InProcessData);

router.patch("/sheets/:id", updateSheet);
router.get("/sheets/process-status", processStatus);
router.get("/sheets/order-subtype-rev", getOrderSubtypeRev);
router.get("/sheets/segmen", getSheetSegmen);
router.get("/sheets/segmen/subtype2", getSegmenSubtype2);
router.get("/sheets/segmen/subtype2/rev", getSegmenSubtype2Rev);
router.get("/sheets/segmen-simplified", getSheetOrderSimplified);
router.get("/sheets/kategori-simplified", getSheetKategoriSimplified);
router.get("/sheets/order-subtype2", getSheetOrderType2);

router.get("/sheets/po", getPO);

export default router;

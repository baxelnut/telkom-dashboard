import express from "express";
import {
  getAllRegional3Data,
  getReg3ReportData,
  updateReg3Data,
  getReg3Status,
  getReg3InProcessData,
  getReg3ProgressOst,
} from "../controllers/regional3Controller.js";
import {
  injectUUID,
  processStatus,
  updateSheet,
  getOrderSubtypeRev,
  getSheetSegmen,
  getSheetOrderType,
  getSheetOrderSimplified,
  getSheetKategoriSimplified,
} from "../controllers/sheetsController.js";

const router = express.Router();

router.get("/", getAllRegional3Data);
router.get("/report", getReg3ReportData);
router.get("/report/in_process", getReg3InProcessData);
router.get("/progress_status", getReg3Status);
router.get("/report/order_sub_type", getReg3ProgressOst);
router.patch("/:id", updateReg3Data);

router.patch("/sheets/:id", updateSheet);
router.get("/sheets/process_status", processStatus);
router.get("/sheets/order_subtype_rev", getOrderSubtypeRev);
router.get("/sheets/segmen", getSheetSegmen);
router.get("/sheets/segmen_simplified", getSheetOrderSimplified);
router.get("/sheets/kategori_simplified", getSheetKategoriSimplified);
router.get("/sheets/order_subtype", getSheetOrderType);

// warning! not dynamically programmed
// router.get("/inject_uuid/beware/reset_format_aosodomoro_sheet", injectUUID);

export default router;

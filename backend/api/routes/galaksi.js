import express from "express";
import {
  getGalaksiData,
  getGalaksiPO,
} from "../controllers/galaksiController.js";

const router = express.Router();

router.get("/data", getGalaksiData);
router.get("/po", getGalaksiPO);

export default router;

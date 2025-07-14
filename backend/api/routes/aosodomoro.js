import express from "express";
import { getSheet } from "../controllers/sheetsController.js";

const router = express.Router();

router.get("/sheets", getSheet);

export default router;

import express from "express";
import { pingHost } from "../controllers/pingController.js";

const router = express.Router();

router.get("/", pingHost);

export default router;

import express from "express";
import { getAllAosodomoro } from "../controllers/aosodomoroController.js";

const router = express.Router();

router.get("/", getAllAosodomoro);

export default router;

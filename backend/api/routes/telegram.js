import express from "express";
import { sendTelegramMessage } from "../utils/sendTelegramMessage.js";
import multer from "multer";
import FormData from "form-data";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const upload = multer();
const router = express.Router();

router.post("/report", async (req, res) => {
  const { message, target = "private" } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    await sendTelegramMessage(message, target);
    res.status(200).json({ success: true, sent: message, target });
  } catch (err) {
    res.status(500).json({ error: "Failed to send Telegram message" });
  }
});

router.post("/photo", upload.single("photo"), async (req, res) => {
  const { target, caption } = req.body; // include caption
  const file = req.file;

  const chat_id =
    target === "group"
      ? process.env.TELEGRAM_GROUP_CHAT_ID
      : process.env.TELEGRAM_CHAT_ID;

  if (!file || !file.buffer) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const form = new FormData();
  form.append("chat_id", chat_id);
  form.append("photo", file.buffer, {
    filename: file.originalname || "table.png",
    contentType: file.mimetype || "image/png",
  });

  if (caption) {
    form.append("caption", caption); // forward caption to Telegram
    form.append("parse_mode", "Markdown"); // allow *bold* etc.
  }

  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendPhoto`,
      form,
      {
        headers: {
          ...form.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    res.status(200).json({ success: true, result: response.data });
  } catch (err) {
    console.error("Telegram photo error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to send photo to Telegram" });
  }
});

export default router;

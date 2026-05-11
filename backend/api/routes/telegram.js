import dotenv from "dotenv";
dotenv.config();

import express from "express";
import axios from "axios";
import multer from "multer";
import FormData from "form-data";

import handleAlert from "../telegram/commands/alert.js";

const upload = multer();
const router = express.Router();

router.post("/alert", async (req, res) => {
  try {
    const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;
    const chatId = process.env.TELEGRAM_CHANNEL_CHAT_ID;
    await handleAlert({ axios, chatId, TELEGRAM_API });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Alert route error:", err.message);
    res.status(500).json({ error: "Failed to send alert" });
  }
});

router.post("/photo", upload.single("photo"), async (req, res) => {
  const { target, caption } = req.body; // include caption
  const file = req.file;

  const chat_id =
    target === "group"
      ? process.env.TELEGRAM_GROUP_CHAT_ID
      : target === "channel"
        ? process.env.TELEGRAM_CHANNEL_CHAT_ID
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
      },
    );

    res.status(200).json({ success: true, result: response.data });
  } catch (err) {
    console.error("Telegram photo error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to send photo to Telegram" });
  }
});

export default router;

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import axios from "axios";
import multer from "multer";
import FormData from "form-data";

const upload = multer();
const router = express.Router();

/**
 * POST /telegram/photo
 * Accepts multipart/form-data:
 * - photo (file)
 * - target (optional) : "group" | "channel" | "private" (used only if chatId not provided)
 * - chatId (optional) : overrides target and forces sending to this chat id
 * - caption (optional) : caption text
 * - parse_mode (optional): e.g. "Markdown" or "HTML" (defaults to Markdown)
 */
router.post("/photo", upload.single("photo"), async (req, res) => {
  try {
    const { target, caption } = req.body;
    let { chatId } = req.body; // chatId may be passed by frontend to force DM to specific user
    const file = req.file;
    if (!file || !file.buffer) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let resolvedChatId; // Resolve chat id
    if (chatId) {
      resolvedChatId = String(chatId).trim(); // ensure string (Telegram accepts strings or numbers)
    } else {
      if (target === "group") {
        resolvedChatId = process.env.TELEGRAM_GROUP_CHAT_ID;
      } else if (target === "channel") {
        resolvedChatId = process.env.TELEGRAM_CHANNEL_CHAT_ID;
      } else {
        resolvedChatId = process.env.TELEGRAM_CHAT_ID; // default private chat id (fallback)
      }
    }

    if (!resolvedChatId) {
      return res.status(400).json({
        error:
          "No chatId resolved. Provide chatId in body or configure TELEGRAM_CHAT_ID / TELEGRAM_GROUP_CHAT_ID / TELEGRAM_CHANNEL_CHAT_ID",
      });
    }

    const form = new FormData();
    form.append("chat_id", resolvedChatId);
    form.append("photo", file.buffer, {
      filename: file.originalname || "table.png",
      contentType: file.mimetype || "image/png",
    });

    if (caption) {
      form.append("caption", caption);
      const parseMode = req.body.parse_mode || "Markdown";
      form.append("parse_mode", parseMode);
    }

    // Send to Telegram
    const telegramResp = await axios.post(
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

    return res.status(200).json({ success: true, result: telegramResp.data });
  } catch (err) {
    console.error(
      "Telegram photo error:",
      err.response?.data || err.message || err
    );
    return res.status(500).json({
      error:
        err.response?.data || err.message || "Failed to send photo to Telegram",
    });
  }
});

export default router;

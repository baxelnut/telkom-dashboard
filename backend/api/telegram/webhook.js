import bot from "../bot/bot.js";

export default async function handler(req, res) {
  console.log("[webhook] incoming request", { method: req.method });

  if (req.method !== "POST") {
    console.log("[webhook] non-POST request");
    return res.status(200).send("OK");
  }

  console.log(
    "[webhook] headers:",
    req.headers && {
      "content-type":
        req.headers["content-type"] || req.headers["Content-Type"],
    }
  );

  try {
    // Log body size and first chunk (avoid huge logging)
    const bodyPreview = (() => {
      try {
        const s = JSON.stringify(req.body);
        return s.length > 2000 ? s.slice(0, 2000) + "...(truncated)" : s;
      } catch (e) {
        return String(req.body).slice(0, 2000);
      }
    })();
    console.log("[webhook] bodyPreview:", bodyPreview);

    // Process update asynchronously so we can respond quickly
    bot.handleUpdate(req.body).catch((err) => {
      console.error("[webhook] bot.handleUpdate async error:", err);
    });

    // immediate 200 so Telegram considers delivery OK
    return res.status(200).send("OK");
  } catch (err) {
    console.error("[webhook] handler top-level error:", err);
    return res.status(500).send("Internal Server Error");
  }
}

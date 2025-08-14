import express from "express";
import axios from "axios";

const router = express.Router();
const GAS_URL = process.env.GAS_WEBAPP_URL;
const GAS_SECRET = process.env.GAS_SECRET;

router.post("/push", async (req, res) => {
  console.log("[GAS] incoming /api/gas/push body:", req.body);
  if (!GAS_URL || !GAS_SECRET) {
    return res
      .status(500)
      .json({ ok: false, error: "GAS not configured on server." });
  }
  try {
    const bodyToSend = {
      ...req.body,
      secret: GAS_SECRET,
      action: req.body?.action || "sync",
    };
    const axiosResp = await axios.post(GAS_URL, bodyToSend, {
      headers: { "Content-Type": "application/json" },
      timeout: 45000,
      validateStatus: () => true,
    });
    const ct = (axiosResp.headers["content-type"] || "").toLowerCase();
    if (
      (ct.includes("application/json") || ct.includes("text/json")) &&
      axiosResp.status >= 200 &&
      axiosResp.status < 300
    ) {
      return res.json({ ok: true, data: axiosResp.data });
    }
    if (typeof axiosResp.data === "string") {
      try {
        const parsed = JSON.parse(axiosResp.data);
        if (axiosResp.status >= 200 && axiosResp.status < 300)
          return res.json({ ok: true, data: parsed });
        return res.status(502).json({
          ok: false,
          error: "GAS non-2xx",
          status: axiosResp.status,
          data: parsed,
        });
      } catch (e) {
        const snippet = axiosResp.data.slice(0, 800);
        return res.status(502).json({
          ok: false,
          error: "GAS returned non-JSON (likely login/redirect)",
          status: axiosResp.status,
          snippet,
        });
      }
    }
    return res.status(502).json({
      ok: false,
      error: "Unexpected GAS response",
      status: axiosResp.status,
      data: axiosResp.data,
    });
  } catch (err) {
    console.error("[GAS] push error:", err && err.message ? err.message : err);
    return res
      .status(500)
      .json({ ok: false, error: err.message || "Server error calling GAS" });
  }
});

// debug GET to check server+env quickly (remove in prod)
// router.get("/push", (req, res) => {
//   return res.json({
//     ok: true,
//     note: "POST /api/gas/push to trigger the sync. This GET is only for debug.",
//     hasGAS_URL: !!GAS_URL,
//     hasGAS_SECRET: !!GAS_SECRET,
//   });
// });

export default router;

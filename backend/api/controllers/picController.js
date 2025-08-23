import { db } from "../firebaseAdmin.js";
import { fetchFormattedReportData } from "./regional3Controller.js";

// Normalizeer for robust comparisons
const normalize = (s) => (s || "").toString().trim().toUpperCase();

// Try to find user's email from Firestore
async function getUserEmailByTelegramId(telegramId) {
  if (!telegramId) return null;
  const snap = await db
    .collection("users")
    .where("telegramId", "==", String(telegramId))
    .limit(1)
    .get();

  if (snap.empty) return null;
  const data = snap.docs[0].data();
  return data.email || null;
}

async function buildPoMap() {
  const rows = await fetchFormattedReportData();
  const map = new Map();
  rows.forEach((r) => {
    const email = (r["PO_EMAIL"] || "").toString().trim();
    const name = (r["PO_NAME"] || "").toString().trim();
    if (email) map.set(email.toLowerCase(), name);
  });
  return map;
}

function summarizeRows(rows) {
  const summary = {
    totalOrders: rows.length,
    totalRevenue: 0,
    byKategori: {},
    byAge: {
      "<3bln": { count: 0, revenue: 0 },
      ">3bln": { count: 0, revenue: 0 },
    },
    sampleItems: rows.slice(0, 30), // include up to 30 items for quick inspection
  };

  rows.forEach((r) => {
    const kat = (r["KATEGORI"] || "UNKNOWN").toString();
    summary.byKategori[kat] = (summary.byKategori[kat] || 0) + 1;

    const rawRevenue = r["REVENUE"];
    const revenue =
      rawRevenue == null ||
      rawRevenue === "" ||
      Number.isNaN(Number(rawRevenue))
        ? 0
        : Number(rawRevenue);

    summary.totalRevenue += revenue;

    const umur = (r["KATEGORI_UMUR"] || "").toString().toUpperCase();
    if (umur.includes("3 BLN")) {
      if (umur.includes("<")) {
        summary.byAge["<3bln"].count += 1;
        summary.byAge["<3bln"].revenue += revenue;
      } else {
        summary.byAge[">3bln"].count += 1;
        summary.byAge[">3bln"].revenue += revenue;
      }
    }
  });

  // round revenue to integers
  summary.totalRevenue = Math.round(summary.totalRevenue);
  summary.byAge["<3bln"].revenue = Math.round(summary.byAge["<3bln"].revenue);
  summary.byAge[">3bln"].revenue = Math.round(summary.byAge[">3bln"].revenue);

  return summary;
}

export async function getReportByPic(req, res) {
  try {
    const picQuery =
      (req.method === "GET" ? req.query.pic : req.body?.pic) || req.params?.pic;
    if (!picQuery)
      return res.status(400).json({ error: "Missing PIC parameter" });

    const target = normalize(picQuery);

    const allRows = await fetchFormattedReportData();
    const matched = allRows.filter((r) => normalize(r["PIC"]) === target);

    const summary = summarizeRows(matched);

    return res.json({
      pic: picQuery,
      matchCount: matched.length,
      summary,
      items: summary.sampleItems,
    });
  } catch (err) {
    console.error("getReportByPic error:", err);
    return res.status(500).json({ error: err.message || "internal" });
  }
}

export async function getReportByTelegramId(req, res) {
  try {
    const telegramId =
      (req.method === "GET" ? req.query.telegramId : req.body?.telegramId) ||
      req.params?.telegramId;
    if (!telegramId)
      return res.status(400).json({ error: "Missing Telegram ID" });

    const email = await getUserEmailByTelegramId(telegramId);
    if (!email)
      return res
        .status(404)
        .json({ error: "User or email not found for given Telegram ID" });

    const poMap = await buildPoMap();
    const poName = poMap.get((email || "").toLowerCase());
    if (!poName) {
      // fallback: maybe user email is not in PO list; attempt to match by user's fullName in users doc
      const snap = await db
        .collection("users")
        .where("telegramId", "==", String(telegramId))
        .limit(1)
        .get();
      const userDoc = snap.empty ? null : snap.docs[0].data();
      const fallbackName = userDoc?.fullName || null;
      if (!fallbackName) {
        return res.status(404).json({
          error:
            "No PO_NAME mapping found for user email, and no fallback name available.",
        });
      }
      // continue with fallback name
      const allRows = await fetchFormattedReportData();
      const matched = allRows.filter(
        (r) => normalize(r["PIC"]) === normalize(fallbackName)
      );
      const summary = summarizeRows(matched);
      return res.json({
        telegramId,
        email,
        usedFallbackFullName: true,
        fallbackName,
        matchCount: matched.length,
        summary,
        items: summary.sampleItems,
      });
    }

    // filter rows where PIC === poName
    const allRows = await fetchFormattedReportData();
    const matched = allRows.filter(
      (r) => normalize(r["PIC"]) === normalize(poName)
    );
    const summary = summarizeRows(matched);

    return res.json({
      telegramId,
      email,
      poName,
      matchCount: matched.length,
      summary,
      items: summary.sampleItems,
    });
  } catch (err) {
    console.error("getReportByTelegramId error:", err);
    return res.status(500).json({ error: err.message || "internal" });
  }
}

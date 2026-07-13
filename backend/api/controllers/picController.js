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
      "<2bln": { count: 0, revenue: 0 },
      ">2bln": { count: 0, revenue: 0 },
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
    if (umur.includes("2 BLN")) {
      if (umur.includes("<")) {
        summary.byAge["<2bln"].count += 1;
        summary.byAge["<2bln"].revenue += revenue;
      } else {
        summary.byAge[">2bln"].count += 1;
        summary.byAge[">2bln"].revenue += revenue;
      }
    }
  });

  // round revenue to integers
  summary.totalRevenue = Math.round(summary.totalRevenue);
  summary.byAge["<2bln"].revenue = Math.round(summary.byAge["<2bln"].revenue);
  summary.byAge[">2bln"].revenue = Math.round(summary.byAge[">2bln"].revenue);

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
    const matched = allRows.filter((r) => normalize(r["PIC"]).includes(target));

    const summary = summarizeRows(matched);

    return res.json({
      pic: picQuery,
      matchCount: matched.length,
      summary,
      items: matched.map((r) => ({
        ...r,
        PIC: r["PIC"],
        PO_NAME: r["PO_NAME"],
      })),
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

    let email = await getUserEmailByTelegramId(telegramId);
    const snap = await db
      .collection("users")
      .where("telegramId", "==", String(telegramId))
      .limit(1)
      .get();
    const userDoc = snap.empty ? null : snap.docs[0].data();
    let fullName = userDoc?.fullName || "";

    // // ===== DEBUG OVERRIDE =====
    // if (fullName === "DEVELOPER") fullName = "Dwieka Septian";
    // if (email === "basilius.tengang.dev@gmail.com")
    //   email = "dwiekasap21@gmail.com";
    // // ==========================

    // Filter by PIC
    const poMap = await buildPoMap();
    const poName = poMap.get((email || "").toLowerCase()) || fullName;
    const allRows = await fetchFormattedReportData();
    const matched = allRows.filter((r) =>
      normalize(r["PIC"]).includes(normalize(poName)),
    );

    // Filter by UMUR_ORDER > 20 && <=60, KATEGORI === "IN PROCESS"
    const filtered = matched.filter((r) => {
      const umur = Number(r["UMUR_ORDER"] ?? 0);
      const kategori = normalize(r["KATEGORI"]);

      const validUmur = umur > 20 && umur <= 60;
      const validKategori = kategori === "IN PROCESS";

      return validUmur && validKategori;
    });

    const summary = summarizeRows(filtered);

    return res.json({
      telegramId,
      email,
      poName,
      matchCount: filtered.length,
      summary,
      items: summary.sampleItems,
      usedDebugOverride:
        fullName !== userDoc?.fullName || email !== userDoc?.email,
    });
  } catch (err) {
    console.error("getReportByTelegramId error:", err);
    return res.status(500).json({ error: err.message || "internal" });
  }
}

export async function getAlertReport(req, res) {
  try {
    const debug = req.query?.debug === "true";
    const allRows = await fetchFormattedReportData();

    // Normalizers/helpers
    const _norm = (v) =>
      v === null || v === undefined ? "" : String(v).toString().trim();

    const parseUmur = (raw) => {
      if (raw === null || raw === undefined) return 0;
      const s = String(raw);
      const m = s.match(/-?\d+/);
      if (!m) return 0;
      const n = Number(m[0]);
      return Number.isNaN(n) ? 0 : n;
    };

    // Filter: UMUR_ORDER > 60 && <=90, KATEGORI === "IN PROCESS"
    const filtered = allRows.filter((r) => {
      const umur = parseUmur(r["UMUR_ORDER"]);
      const kategori = _norm(r["KATEGORI"]).toUpperCase();

      const validUmur = umur > 20 && umur <= 60;
      const validKategori = kategori === "IN PROCESS";

      return validUmur && validKategori;
    });

    // Group by PIC + NEW_WITEL
    const grouped = {};
    filtered.forEach((r) => {
      const pic = _norm(r["PIC"]) || "UNKNOWN";
      const witel = _norm(r["NEW_WITEL"]) || "-";
      const key = `${pic}|||${witel}`;
      if (!grouped[key]) grouped[key] = { pic, witel, statuses: {}, total: 0 };

      const statusLabel = _norm(r["STATUS"]) || "No Status";
      grouped[key].statuses[statusLabel] =
        (grouped[key].statuses[statusLabel] || 0) + 1;
      grouped[key].total++;
    });

    const result = Object.values(grouped);

    if (debug) {
      return res.json({
        totalRows: allRows.length,
        filteredCount: filtered.length,
        sampleFilteredRows: filtered.slice(0, 10),
        grouped: result,
      });
    }

    return res.json(result);
  } catch (err) {
    console.error("getAlertReport error:", err);
    return res.status(500).json({ error: err.message || "internal" });
  }
}

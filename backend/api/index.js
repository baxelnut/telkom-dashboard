import express from "express";
import cors from "cors";

import regional3Routes from "./routes/regional.js";
import exportToSheet from "./routes/exportToSheet.js";
import galaksi from "./routes/galaksi.js";
import admin from "./routes/admin.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));

const PORT = process.env.PORT || 5000;

app.use("/api/regional_3", regional3Routes);
app.use("/api/export_to_sheet", exportToSheet);
app.use("/api/galaksi", galaksi);
app.use("/api/admin", admin);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

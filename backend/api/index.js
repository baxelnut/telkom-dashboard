import express from "express";
import cors from "cors";
import aosodomoroRoutes from "./routes/aosodomoro.js";
import regional3Routes from "./routes/regional.js";
import helloExample from "./example/hello.js";
import exportToSheet from "./routes/exportToSheet.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));

const PORT = process.env.PORT || 5000;

app.use("/api/hello", helloExample);
app.use("/api/aosodomoro", aosodomoroRoutes);
app.use("/api/regional_3", regional3Routes);

app.use("/api/export_to_sheet", exportToSheet);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

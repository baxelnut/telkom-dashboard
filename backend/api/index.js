import express from "express";
import cors from "cors";
import aosodomoroRoutes from "./routes/aosodomoro.js";
import regional3Routes from "./routes/regional.js";
import updateReg3Data from "./routes/regional.js";
import helloExample from "./example/hello.js";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// test
app.use("/api/hello", helloExample);

// Fetch all AOSODOMORO table
app.use("/api/aosodomoro", aosodomoroRoutes);

// Fetch regional_3 table
app.use("/api/regional_3", regional3Routes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

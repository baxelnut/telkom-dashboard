import express from "express";
import cors from "cors";
import aosodomoroRoutes from "./routes/aosodomoro.js";
import helloExample from "./example/hello.js";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Fetch all AOSODOMORO table
app.use("/api/aosodomoro", aosodomoroRoutes);

// test
app.use("/api/hello", helloExample);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

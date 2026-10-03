import express from "express";
import "dotenv/config";
import cors from "cors";
import pool from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import listingRoutes from "./routes/listingRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

const port = Number(process.env.PORT);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
  });
});

app.get("/api/db-test", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 + 1 AS result");

    res.json({
      data: rows[0],
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      error: "Database connection failed",
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

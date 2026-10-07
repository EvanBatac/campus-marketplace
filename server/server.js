import express from "express";
import http from "http";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import "dotenv/config";
import cors from "cors";
import pool from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import listingRoutes from "./routes/listingRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
  },
});

io.use((socket, next) => {
  const token = socket.handshake.query?.token;

  if (typeof token !== "string") {
    return next(new Error("unauthorized"));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = { id: decoded.id };
    next();
  } catch (error) {
    next(new Error("unauthorized"));
  }
});
io.on("connection", (socket) => {
  console.log("Client connected: ", socket.user.id, socket.id);

  socket.on("disconnect", (reason) => {
    console.log("Client disconnected: ", socket.user.id, reason);
  });
});
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
app.use("/api/conversations", conversationRoutes);

httpServer.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

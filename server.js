import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import morgan from "morgan";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan("dev"));
app.use(express.static("public"));

const PORT = process.env.PORT || 10000;
const matchesPath = path.resolve("src/mock/live.json");

app.get("/api/matches", (req, res) => {
  try {
    const data = fs.readFileSync(matchesPath, "utf8");
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: "Failed to load matches" });
  }
});

io.on("connection", (socket) => {
  console.log("📡 User connected");

  socket.on("disconnect", () => {
    console.log("❌ User disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const expenseRoutes = require("./routes/expenses");

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",").map((origin) => origin.trim());

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("This origin is not allowed by CORS."));
  }
}));
app.use(express.json({ limit: "20kb" }));

app.get("/", (_req, res) => res.json({ name: "SpendWise API", status: "running" }));
app.get("/health", (_req, res) => res.json({
  status: "ok",
  database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
}));
app.use("/api/expenses", expenseRoutes);

app.use((err, _req, res, _next) => {
  console.error(err.message);
  const status = err.status || 500;
  res.status(status).json({ message: status === 500 ? "Something went wrong on the server." : err.message });
});

async function start() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is missing. Add it to server/.env before starting.");
    process.exit(1);
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`SpendWise API listening on port ${PORT}`));
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
}

start();

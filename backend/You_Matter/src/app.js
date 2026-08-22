import express from 'express';
import cors from 'cors';
import morgan from "morgan";
import supabase from "./config/supabaseClient.js";

import userRoutes from './routes/userRoutes.js';
import guardianRoutes from './routes/guardianRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { apiLimiter } from "./middleware/rateLimiter.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
app.set("trust proxy", 1);

const allowedOrigins = [
  "https://you-matter-reborn-641a.vercel.app",
  "https://you-matter-seven.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:4173",
  "http://127.0.0.1:5173",
];

if (process.env.FRONTEND_URL) {
  process.env.FRONTEND_URL.split(',').forEach((url) => {
    const clean = url.trim().replace(/\/$/, "");
    if (clean && !allowedOrigins.includes(clean)) {
      allowedOrigins.push(clean);
    }
  });
}

if (process.env.ALLOWED_ORIGINS) {
  process.env.ALLOWED_ORIGINS.split(',').forEach((url) => {
    const clean = url.trim().replace(/\/$/, "");
    if (clean && !allowedOrigins.includes(clean)) {
      allowedOrigins.push(clean);
    }
  });
}

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/$/, "");
    if (allowedOrigins.includes(cleanOrigin) || allowedOrigins.some(o => cleanOrigin.endsWith(o.replace(/^https?:\/\//, '')))) {
      return callback(null, true);
    }
    // Allow any Vercel domain in production to prevent CORS blockage
    if (cleanOrigin.endsWith(".vercel.app")) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "apikey",
    "X-Client-Info",
    "x-user-id",
    "x-user-name",
    "x-user-email",
    "X-Requested-With",
    "Accept"
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

// Mount CORS before express.json(), routes, and rate limiters
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("dev"));
app.use(apiLimiter);

// Health Check Endpoints
app.get('/health', (req, res) => {
  res.status(200).send("OK");
});

app.get('/health/live', (req, res) => {
  res.status(200).json({ status: "alive" });
});

app.get('/health/ready', async (req, res) => {
  try {
    const { error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    if (error) throw error;
    res.status(200).json({ status: "ready", database: "connected" });
  } catch (err) {
    res.status(503).json({ status: "unready", database: "disconnected", error: err.message });
  }
});

// Base API route
app.get('/api/v1', (req, res) => {
  res.json({
    message: "YouMatter / NeoMate API v1 is running",
    version: "1.0.0",
    health: "/health"
  });
});

// Main routes
app.use('/api/v1', userRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1', guardianRoutes);
app.use('/api/v1/user', guardianRoutes);
app.use('/api/v1/ai', aiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Route not found" } });
});

// Error handler
app.use(errorHandler);

export default app;
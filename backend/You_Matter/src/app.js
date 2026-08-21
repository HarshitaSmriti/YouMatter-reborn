import express from 'express';
import morgan from "morgan";
import supabase from "./config/supabaseClient.js";

import userRoutes from './routes/userRoutes.js';
import guardianRoutes from './routes/guardianRoutes.js';
import { apiLimiter } from "./middleware/rateLimiter.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Universal CORS & Preflight Middleware (ensures CORS headers on ALL requests, OPTIONS, and errors)
app.use((req, res, next) => {
  const origin = req.headers.origin;

  const allowedOrigins = [
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

  const reqOrigin = origin ? origin.replace(/\/$/, "") : "";
  if (origin && (allowedOrigins.includes(reqOrigin) || allowedOrigins.some(o => reqOrigin.endsWith(o.replace(/^https?:\/\//, ''))))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else if (origin) {
    // Fallback in production so browser never blocks valid frontend requests
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, x-user-id, x-user-name");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Immediate HTTP 200 response for browser preflight OPTIONS requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("dev"));
app.use(apiLimiter);

// Health Check Endpoints
app.get('/health', (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString(), service: "YouMatter Backend API" });
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
app.use('/api/v1', guardianRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Route not found" } });
});

// Error handler
app.use(errorHandler);

export default app;
import express from 'express';
import cors from 'cors';
import morgan from "morgan";
import supabase from "./config/supabaseClient.js";

import userRoutes from './routes/userRoutes.js';
import guardianRoutes from './routes/guardianRoutes.js';
import { apiLimiter } from "./middleware/rateLimiter.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Configure Production CORS Origins
const defaultAllowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:4173",
  "http://127.0.0.1:5173",
  "https://you-matter-seven.vercel.app",
];

const getDynamicAllowedOrigins = () => {
  const origins = [...defaultAllowedOrigins];

  const envFrontend = process.env.FRONTEND_URL;
  if (envFrontend) {
    envFrontend.split(',').forEach((url) => {
      const trimmed = url.trim().replace(/\/$/, "");
      if (trimmed && !origins.includes(trimmed)) {
        origins.push(trimmed);
      }
    });
  }

  const envOrigins = process.env.ALLOWED_ORIGINS;
  if (envOrigins) {
    envOrigins.split(',').forEach((url) => {
      const trimmed = url.trim().replace(/\/$/, "");
      if (trimmed && !origins.includes(trimmed)) {
        origins.push(trimmed);
      }
    });
  }

  return origins;
};

const allowedOriginsList = getDynamicAllowedOrigins();

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (mobile apps, Postman, cURL, server-to-server) where origin is undefined
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/$/, "");
    if (allowedOriginsList.includes(cleanOrigin) || allowedOriginsList.some(o => cleanOrigin.endsWith(o.replace(/^https?:\/\//, '')))) {
      return callback(null, true);
    }

    console.warn(`⚠️ Notice: CORS request received from origin: ${origin}`);
    // Permit origin in fallback mode while preserving authentication headers
    return callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "x-user-id", "x-user-name"],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Apply CORS middleware & preflight handling globally BEFORE rate limiting
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

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
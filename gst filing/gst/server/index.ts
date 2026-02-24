import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { config } from "dotenv";
import { testConnection, initializeDatabase } from "./db";
import cors from "cors";

// Load environment variables from .env file
config();

// Debug: Check if API key is loaded
if (process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY) {
  console.log('✅ Google API key loaded successfully');
} else {
  console.warn('⚠️ Google API key not found in environment variables');
}

const app = express();

// CORS configuration to allow government portal access
app.use(cors({
  origin: [
    'http://localhost:5173', // Local development
    'http://localhost:3000', // Alternative local port
    'https://standalone-government-portal.netlify.app', // Production government portal
    'https://gst-portal-demo.surge.sh' // Legacy government portal
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize database before starting server
  try {
    log('🔧 Initializing database...');
    await initializeDatabase();
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }
    log('✅ Database initialized successfully');
  } catch (error) {
    log('❌ Database initialization failed:', String(error));
    log('⚠️ Server will continue but database features may not work');
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 3001 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '3001', 10);

server.listen(port, "0.0.0.0", () => {
  log(`serving on http://localhost:${port}`);
});
})();


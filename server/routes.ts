import type { Express, Request, Response } from "express";
import express from "express";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { createProxyMiddleware } from "http-proxy-middleware";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function registerRoutes(app: Express) {
  // Proxy API calls to Python backend
  app.use('/api', createProxyMiddleware({
    target: 'http://localhost:8000',
    changeOrigin: true,
    pathRewrite: {
      '^/api': '/api'
    },
    // onError: (err, req, res) => {
    //   console.error('Proxy error:', err);
    //   res.status(500).json({ error: 'Backend service unavailable' });
    // }
  }));


  // Serve static files from the public directory
  const publicPath = path.join(__dirname, "..", "dist", "public");
  if (fs.existsSync(publicPath)) {
    app.use(express.static(publicPath));
  }

  // Catch-all route for frontend routing
  app.get("*", (_req: Request, res: Response) => {
    const indexPath = path.join(publicPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.json({
        message: "FinSync API",
        note: "Frontend files not found. Run 'npm run build' first.",
        endpoints: ["/api/health", "/api/latest-excel", "/api/download-excel","/api/download-history"]
      });
    }
  });
}

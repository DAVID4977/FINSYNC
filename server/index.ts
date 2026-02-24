import express from "express";
import { registerRoutes } from "./routes";
import { createServer } from "http";
import { type Server } from "http";

const PORT = process.env.PORT || 3000;

async function startServer(): Promise<Server> {
  const app = express();
  
  // Register routes
  registerRoutes(app);
  
  // Create HTTP server
  const server = createServer(app);
  
  return new Promise((resolve) => {
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

// Start the server
startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

export default startServer;

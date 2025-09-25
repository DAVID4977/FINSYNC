import dotenv from "dotenv";
import { initializeDatabase, testConnection } from "./db";
import { migrate } from "drizzle-orm/mysql2/migrator";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

// Load environment variables
dotenv.config();

async function setupDatabase() {
  console.log("🔧 Setting up GST Filing Database...");
  
  try {
    // Step 1: Initialize database (create if not exists)
    console.log("\n📋 Step 1: Initializing database...");
    await initializeDatabase();

    // Step 2: Test connection
    console.log("\n📋 Step 2: Testing database connection...");
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error("Database connection failed");
    }

    // Step 3: Run migrations if any exist
    console.log("\n📋 Step 3: Checking for migrations...");
    try {
      const migrationConnection = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'vavi@1213',
        database: 'gst_filing_db',
        multipleStatements: true
      });
      
      const migrationDb = drizzle(migrationConnection, { mode: 'default' });
      
      // Check if migrations folder exists and has files
      const fs = await import('fs');
      const path = await import('path');
      const migrationsPath = path.join(process.cwd(), 'migrations');
      
      if (fs.existsSync(migrationsPath)) {
        const migrationFiles = fs.readdirSync(migrationsPath).filter(f => f.endsWith('.sql'));
        if (migrationFiles.length > 0) {
          console.log(`Found ${migrationFiles.length} migration(s), applying...`);
          await migrate(migrationDb, { migrationsFolder: migrationsPath });
          console.log("✅ Migrations applied successfully");
        } else {
          console.log("ℹ️ No migration files found");
        }
      } else {
        console.log("ℹ️ Migrations folder doesn't exist yet");
      }
      
      await migrationConnection.end();
    } catch (migrationError) {
      console.log("ℹ️ Migration step skipped:", (migrationError as Error).message);
    }

    console.log("\n🎉 Database setup completed successfully!");
    console.log("\n📊 Database Information:");
    console.log("  Database Name: gst_filing_db");
    console.log("  Host: localhost");
    console.log("  Port: 3306");
    console.log("  User: root");
    console.log("\n📋 Next Steps:");
    console.log("  1. Run 'npm run db:generate' to generate migration files");
    console.log("  2. Run 'npm run db:push' to push schema to database");
    console.log("  3. Run 'npm run dev' to start the development server");

  } catch (error) {
    console.error("\n❌ Database setup failed:", error);
    console.error("\n🔧 Troubleshooting:");
    console.error("  1. Make sure MySQL server is running");
    console.error("  2. Verify MySQL credentials (username: root, password: vavi@1213)");
    console.error("  3. Check if MySQL port 3306 is accessible");
    console.error("  4. Ensure MySQL user has CREATE DATABASE privileges");
    process.exit(1);
  }
}

// Run setup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase();
}

export { setupDatabase };
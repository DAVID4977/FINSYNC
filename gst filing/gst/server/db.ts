import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../shared/schema";

const connectionString = `mysql://root:vavi@1213@localhost:3306/gst_filing_db`;

// Create connection pool for better performance
const poolConnection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'vavi@1213',
  database: 'gst_filing_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const db = drizzle(poolConnection, { schema, mode: 'default' });

// Function to test database connection
export async function testConnection() {
  try {
    const connection = await poolConnection.getConnection();
    console.log('✅ MySQL database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ MySQL connection failed:', error);
    return false;
  }
}

// Function to initialize database (create database if not exists)
export async function initializeDatabase() {
  try {
    // Create connection without specifying database to create it
    const adminConnection = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: 'vavi@1213'
    });

    // Create database if it doesn't exist
    await adminConnection.execute('CREATE DATABASE IF NOT EXISTS gst_filing_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✅ Database "gst_filing_db" created or already exists');
    
    await adminConnection.end();
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
}

export default db;
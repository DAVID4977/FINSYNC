#!/usr/bin/env python3
"""
Script to create download_history table in PostgreSQL database
"""
import os
import psycopg2
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database connection parameters
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "FinSync"
DB_USER = "david-r"
DB_PASSWORD = ""  # Add password if needed

def create_download_history_table():
    """Create download_history table if it doesn't exist"""
    try:
        # Connect to PostgreSQL
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
        
        cursor = conn.cursor()
        
        # Create table
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS download_history (
            id VARCHAR(36) PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            filename VARCHAR(255) NOT NULL,
            file_type VARCHAR(50) DEFAULT 'excel',
            download_type VARCHAR(50) NOT NULL,
            period VARCHAR(7),
            invoices_count INTEGER DEFAULT 0,
            file_size INTEGER,
            file_path TEXT,
            downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        
        cursor.execute(create_table_sql)
        
        # Create indexes
        index_sql = """
        CREATE INDEX IF NOT EXISTS idx_download_history_user_id ON download_history(user_id);
        CREATE INDEX IF NOT EXISTS idx_download_history_downloaded_at ON download_history(downloaded_at);
        """
        
        cursor.execute(index_sql)
        
        conn.commit()
        print("✅ download_history table created successfully")
        
        # Check if table exists and show structure
        cursor.execute("""
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'download_history'
            ORDER BY ordinal_position;
        """)
        
        columns = cursor.fetchall()
        print("\n📋 Table structure:")
        for col in columns:
            print(f"  - {col[0]}: {col[1]} ({'NULL' if col[2] == 'YES' else 'NOT NULL'})")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error creating table: {e}")

if __name__ == "__main__":
    create_download_history_table()



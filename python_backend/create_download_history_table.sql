-- Create download_history table in PostgreSQL
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

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_download_history_user_id ON download_history(user_id);
CREATE INDEX IF NOT EXISTS idx_download_history_downloaded_at ON download_history(downloaded_at);



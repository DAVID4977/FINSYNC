import mysql from "mysql2/promise";

async function pushSchema() {
  console.log('🔧 Pushing database schema...');
  
  try {
    // Create connection pool
    const poolConnection = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: 'vavi@1213',
      database: 'gst_filing_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      acquireTimeout: 60000,
      timeout: 60000,
      reconnect: true
    });

    console.log('✅ Connected to gst_filing_db database');

    // Create all tables
    const createQueries = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        company VARCHAR(255),
        gstin VARCHAR(15),
        pan_number VARCHAR(10),
        avatar TEXT,
        password VARCHAR(255) NOT NULL,
        phone_number VARCHAR(15),
        address TEXT,
        role VARCHAR(50) DEFAULT 'user',
        is_active BOOLEAN DEFAULT TRUE,
        is_email_verified BOOLEAN DEFAULT FALSE,
        last_login_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      
      // User sessions table
      `CREATE TABLE IF NOT EXISTS user_sessions (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        session_token VARCHAR(255) NOT NULL UNIQUE,
        device_info TEXT,
        ip_address VARCHAR(45),
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
      
      // GST returns table
      `CREATE TABLE IF NOT EXISTS gst_returns (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        return_type VARCHAR(20) NOT NULL,
        period VARCHAR(7) NOT NULL,
        financial_year VARCHAR(9) NOT NULL,
        status VARCHAR(20) NOT NULL,
        total_turnover DECIMAL(15,2),
        total_tax DECIMAL(15,2),
        igst_amount DECIMAL(15,2),
        cgst_amount DECIMAL(15,2),
        sgst_amount DECIMAL(15,2),
        cess_amount DECIMAL(15,2),
        return_data JSON,
        acknowledge_number VARCHAR(50),
        filed_at TIMESTAMP NULL,
        due_date TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
      
      // Invoices table
      `CREATE TABLE IF NOT EXISTS invoices (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        gst_return_id VARCHAR(36),
        invoice_number VARCHAR(100) NOT NULL,
        invoice_date TIMESTAMP NOT NULL,
        invoice_type VARCHAR(20) DEFAULT 'B2B',
        gstin VARCHAR(15),
        buyer_name VARCHAR(255),
        buyer_address TEXT,
        buyer_state VARCHAR(50),
        place_of_supply VARCHAR(50),
        reverse_charge BOOLEAN DEFAULT FALSE,
        invoice_value DECIMAL(15,2),
        taxable_value DECIMAL(15,2),
        igst_rate DECIMAL(5,2),
        igst_amount DECIMAL(15,2),
        cgst_rate DECIMAL(5,2),
        cgst_amount DECIMAL(15,2),
        sgst_rate DECIMAL(5,2),
        sgst_amount DECIMAL(15,2),
        cess_rate DECIMAL(5,2),
        cess_amount DECIMAL(15,2),
        hsn_code VARCHAR(10),
        item_description TEXT,
        quantity DECIMAL(15,3),
        unit VARCHAR(20),
        status VARCHAR(20) DEFAULT 'processed',
        file_name VARCHAR(255),
        extracted_data JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (gst_return_id) REFERENCES gst_returns(id)
      )`,
      
      // Uploaded files table
      `CREATE TABLE IF NOT EXISTS uploaded_files (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        file_size INT,
        file_type VARCHAR(50),
        mime_type VARCHAR(100),
        file_path TEXT,
        status VARCHAR(20) DEFAULT 'processing',
        extracted_data JSON,
        extraction_log TEXT,
        invoices_extracted INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
      
      // Download history table
      `CREATE TABLE IF NOT EXISTS download_history (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        file_type VARCHAR(50) NOT NULL DEFAULT 'excel',
        download_type VARCHAR(50) NOT NULL,
        period VARCHAR(7),
        invoices_count INT DEFAULT 0,
        file_size INT,
        file_path TEXT,
        downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
      
      // Compliance history table
      `CREATE TABLE IF NOT EXISTS compliance_history (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        compliance_type VARCHAR(50) NOT NULL,
        period VARCHAR(7) NOT NULL,
        due_date TIMESTAMP NOT NULL,
        filed_date TIMESTAMP NULL,
        status VARCHAR(20) NOT NULL,
        penalty_amount DECIMAL(15,2),
        remarks TEXT,
        document_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
      
      // Audit logs table
      `CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36),
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id VARCHAR(36),
        old_data JSON,
        new_data JSON,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`,
      
      // Government Portal Users table
      `CREATE TABLE IF NOT EXISTS gov_portal_users (
        id VARCHAR(36) PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        gstin VARCHAR(15) NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        pan_number VARCHAR(10) NOT NULL,
        phone_number VARCHAR(15),
        address TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        last_login_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      
      // Government Portal Sessions table
      `CREATE TABLE IF NOT EXISTS gov_portal_sessions (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        session_token VARCHAR(500) NOT NULL UNIQUE,
        device_info TEXT,
        ip_address VARCHAR(45),
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES gov_portal_users(id) ON DELETE CASCADE
      )`,
      
      // Government Portal File Uploads table
      `CREATE TABLE IF NOT EXISTS gov_portal_uploads (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        file_size INT,
        file_type VARCHAR(50),
        return_type VARCHAR(20) NOT NULL,
        financial_year VARCHAR(9) NOT NULL,
        period VARCHAR(7) NOT NULL,
        quarter VARCHAR(20),
        reference_number VARCHAR(50),
        status VARCHAR(20) DEFAULT 'submitted',
        uploaded_data JSON,
        acknowledgment_number VARCHAR(50),
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES gov_portal_users(id) ON DELETE CASCADE
      )`
    ];

    console.log('📋 Creating database tables...');
    
    for (const query of createQueries) {
      await poolConnection.execute(query);
    }

    console.log('✅ All database tables created successfully!');

    // Show tables to confirm
    const [tables] = await poolConnection.execute('SHOW TABLES');
    console.log('📊 Created tables:');
    tables.forEach(table => {
      console.log(`   - ${Object.values(table)[0]}`);
    });

    await poolConnection.end();
    console.log('✅ Schema push completed successfully!');
    
  } catch (error) {
    console.error('❌ Schema push failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

pushSchema();
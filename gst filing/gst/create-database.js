import mysql from 'mysql2/promise';

async function createDatabase() {
  console.log('🔧 Creating MySQL database...');
  
  try {
    // Create connection without specifying database
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'vavi@1213',
      port: 3306
    });

    console.log('✅ Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.execute('CREATE DATABASE IF NOT EXISTS gst_filing_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✅ Database "gst_filing_db" created successfully');

    // Show databases to confirm
    const [databases] = await connection.execute('SHOW DATABASES LIKE "gst_filing_db"');
    if (databases.length > 0) {
      console.log('✅ Database "gst_filing_db" exists and is ready');
    }

    await connection.end();
    console.log('✅ Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database creation failed:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('❌ MySQL authentication failed. Please check:');
      console.error('   - Username: root');
      console.error('   - Password: vavi@1213');
      console.error('   - MySQL server is running');
    }
    process.exit(1);
  }
}

createDatabase();
import mysql from 'mysql2/promise';

async function fixDatabaseSchema() {
  console.log('🔧 Fixing database schema...');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'vavi@1213',
      database: 'gst_filing_db'
    });

    console.log('✅ Connected to gst_filing_db database');

    // Fix column sizes that are too small
    const alterQueries = [
      // Increase session_token size for JWT tokens
      'ALTER TABLE user_sessions MODIFY COLUMN session_token VARCHAR(500) NOT NULL',
      
      // Increase user_agent size for long browser strings
      'ALTER TABLE audit_logs MODIFY COLUMN user_agent TEXT',
      
      // Make sure device_info can handle long strings
      'ALTER TABLE user_sessions MODIFY COLUMN device_info TEXT',
      
      // Ensure password field is large enough for bcrypt hashes
      'ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NOT NULL'
    ];

    console.log('📋 Updating database schema...');
    
    for (const query of alterQueries) {
      try {
        await connection.execute(query);
        console.log('✅ Executed:', query.substring(0, 50) + '...');
      } catch (error) {
        console.log('⚠️ Skipped (might already be correct):', query.substring(0, 50) + '...');
      }
    }

    // Show updated table structure
    console.log('\n📊 Updated table structures:');
    
    const tables = ['users', 'user_sessions', 'audit_logs'];
    for (const table of tables) {
      console.log(`\n--- ${table.toUpperCase()} TABLE ---`);
      const [columns] = await connection.execute(`DESCRIBE ${table}`);
      console.table(columns);
    }

    await connection.end();
    console.log('\n✅ Database schema fixes completed successfully!');
    
  } catch (error) {
    console.error('❌ Schema fix failed:', error.message);
    process.exit(1);
  }
}

fixDatabaseSchema();
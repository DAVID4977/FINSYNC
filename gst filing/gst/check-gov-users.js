import mysql from 'mysql2/promise';

async function checkGovUsers() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'vavi@1213',
      database: 'gst_filing_db'
    });

    console.log('✅ Connected to database');

    // Check if gov_portal_users table exists
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'gst_filing_db' 
      AND TABLE_NAME LIKE '%gov%'
    `);
    
    console.log('\n📋 Government portal tables:', tables);

    if (tables.some(table => table.TABLE_NAME === 'gov_portal_users')) {
      // Get all government portal users
      const [users] = await connection.execute('SELECT * FROM gov_portal_users');
      console.log('\n👥 Government portal users:');
      console.log(users);

      console.log(`\n📊 Total government users: ${users.length}`);
    } else {
      console.log('❌ gov_portal_users table does not exist');
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Database error:', error);
  }
}

checkGovUsers();
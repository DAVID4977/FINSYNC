#!/usr/bin/env node

import { showAllTables, showUsersTable, showInvoicesTable, showGstReturnsTable, showUploadedFilesTable, showDatabaseSummary } from './server/db-utils.js';

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0] || 'all';

async function main() {
  console.log('🚀 GST Filing Database Viewer');
  console.log('============================');
  
  try {
    switch (command.toLowerCase()) {
      case 'users':
        await showUsersTable();
        break;
      case 'invoices':
        await showInvoicesTable();
        break;
      case 'returns':
        await showGstReturnsTable();
        break;
      case 'files':
        await showUploadedFilesTable();
        break;
      case 'summary':
        await showDatabaseSummary();
        break;
      case 'all':
      default:
        await showAllTables();
        break;
    }
  } catch (error) {
    console.error('❌ Database viewer error:', error);
    process.exit(1);
  }
}

// Show help if requested
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
📖 Database Viewer Usage:

  npm run db:view [command]

Commands:
  all       - Show all tables (default)
  summary   - Show database summary with counts
  users     - Show users table
  invoices  - Show invoices table  
  returns   - Show GST returns table
  files     - Show uploaded files table

Examples:
  npm run db:view
  npm run db:view summary
  npm run db:view invoices
  npm run db:view users
  `);
  process.exit(0);
}

main();
import * as fs from 'fs';
import * as path from 'path';

import * as dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config({ path: '.env.local' });

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
  });

  try {
    console.log('Running migration...');
    
    const sqlPath = path.join(__dirname, 'migrations', '0001_add_display_type.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await pool.query(sql);
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration(); 
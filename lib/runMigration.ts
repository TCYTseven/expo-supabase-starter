import { supabase } from "@/config/supabase";
import fs from 'fs';
import path from 'path';

/**
 * Runs a SQL migration from a file
 */
async function runMigration(filePath: string) {
  try {
    console.log(`Running migration: ${filePath}`);
    
    // Read the SQL file
    const sql = fs.readFileSync(path.resolve(filePath), 'utf8');
    
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('Migration failed:', error);
      throw error;
    }
    
    console.log(`Migration completed successfully: ${filePath}`);
  } catch (error) {
    console.error('Error running migration:', error);
    throw error;
  }
}

/**
 * Main function to run all migrations
 */
async function main() {
  const migrationsDir = path.resolve(__dirname, '../db/migrations');
  
  // Read all migration files
  const migrationFiles = fs.readdirSync(migrationsDir);
  
  // Sort files to ensure they're executed in order
  migrationFiles.sort();
  
  // Execute each migration
  for (const file of migrationFiles) {
    if (file.endsWith('.sql')) {
      await runMigration(path.join(migrationsDir, file));
    }
  }
  
  console.log('All migrations completed successfully');
}

// Run migrations if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Migration process failed:', error);
    process.exit(1);
  });
}

export { runMigration, main }; 
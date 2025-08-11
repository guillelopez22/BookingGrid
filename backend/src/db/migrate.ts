import pool from './pool';
import fs from 'fs';
import path from 'path';

async function migrate() {
  try {
    console.log('Starting database migration...');
    
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, 'schema.sql'),
      'utf-8'
    );
    
    const statements = schemaSQL
      .split(';')
      .filter(stmt => stmt.trim())
      .map(stmt => stmt + ';');
    
    for (const statement of statements) {
      if (statement.includes('CREATE DATABASE')) {
        continue;
      }
      await pool.query(statement);
    }
    
    // Seed initial machines (5x5 grid)
    const machinesCount = await pool.query('SELECT COUNT(*) FROM machines');
    if (parseInt(machinesCount.rows[0].count) === 0) {
      console.log('Seeding machines...');
      for (let row = 1; row <= 5; row++) {
        for (let col = 1; col <= 5; col++) {
          await pool.query(
            'INSERT INTO machines (row_number, column_number) VALUES ($1, $2)',
            [row, col]
          );
        }
      }
      console.log('25 machines created (5x5 grid)');
    }
    
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
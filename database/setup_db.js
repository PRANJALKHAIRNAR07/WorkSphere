const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

async function setupDatabase() {
  console.log('🔄 Initializing WorkSphere MySQL Database Setup...');
  
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'worksphere_db';

  try {
    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true
    });

    console.log(`✅ Connected to MySQL server at ${host}:${port}`);

    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('📜 Executing schema.sql script...');
    await connection.query(schemaSql);
    console.log('✨ Database schema created successfully.');

    const seedsPath = path.join(__dirname, 'seeds.sql');
    if (fs.existsSync(seedsPath)) {
      console.log('🌱 Executing seeds.sql script...');
      const seedsSql = fs.readFileSync(seedsPath, 'utf8');
      await connection.query(seedsSql);
      console.log('🎉 Database seeded with initial sample data successfully.');
    }

    await connection.end();
    console.log('🚀 WorkSphere Database Setup Finished!');
  } catch (error) {
    console.error('❌ Error during database setup:', error.message);
    console.log('⚠️ Note: If MySQL is not running locally yet, you can run `npm run db:setup` once your MySQL service is started.');
  }
}

setupDatabase();

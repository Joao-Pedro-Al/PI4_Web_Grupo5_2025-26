const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://grupo5:SlmPl5GlPIivIBJWNHBTFVC5ITrHTUty@dpg-d4vh1ju3jp1c73elefsg-a-external.frankfurt-postgres.render.com/pi4_g5',
  ssl: {
    rejectUnauthorized: false
  }
});

async function run() {
  try {
    console.log('Connecting to remote external PostgreSQL...');
    await client.connect();
    console.log('Connected successfully!');
    
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema='public'
    `);
    console.log('Tables:', tables.rows.map(r => r.table_name));
    
  } catch (err) {
    console.error('Connection error:', err);
  } finally {
    await client.end();
  }
}

run();

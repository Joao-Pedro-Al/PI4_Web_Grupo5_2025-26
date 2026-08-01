const { Client } = require('pg');

const passwords = [
  'postgres', '123456', 'admin', 'SQL-Ranhoso123', 'root', 'password',
  'postgres123', '1234', '12345', 'password123', 'admin123', 'root123',
  'pi4_g5', 'PI4_g5', 'PI4_G5', 'SlmPl5GlPIivIBJWNHBTFVC5ITrHTUty',
  'joao', 'joaopedro', 'grupo5', 'grupo5123', '12345678', '123456789'
];

async function testLocalPG() {
  for (const pwd of passwords) {
    const client = new Client({
      user: 'postgres',
      host: 'localhost',
      database: 'postgres',
      password: pwd,
      port: 5432,
    });
    try {
      await client.connect();
      console.log(`🎉 SUCCESS! Local PostgreSQL connected with password: "${pwd}"`);
      
      const res = await client.query("SELECT datname FROM pg_database WHERE datname = 'pi4_g5'");
      console.log("Database pi4_g5 exists?", res.rows.length > 0);
      
      await client.end();
      return pwd;
    } catch (err) {
      // quiet
    }
  }
  console.log("❌ None of the standard passwords worked.");
}

testLocalPG();

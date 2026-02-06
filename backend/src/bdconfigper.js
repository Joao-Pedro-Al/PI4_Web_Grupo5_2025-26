const { Pool } = require('pg');

// Configuração direta para o teu pgAdmin local
const pool = new Pool({
  user: 'postgres',          // O teu utilizador do Postgres (padrão é postgres)
  host: 'localhost',         
  database: 'basededadosPe',     // MUDA ISTO para o nome da Base de Dados que criaste no pgAdmin
  password: 'DaNstUP534',   // MUDA ISTO para a password que usas no pgAdmin
  port: 5432,
});

pool.on('connect', () => {
  console.log('✅ Ligado ao PostgreSQL local via pgAdmin!');
});

module.exports = pool;
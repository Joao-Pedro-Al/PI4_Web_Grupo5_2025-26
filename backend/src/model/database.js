const Sequelize = require('sequelize');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();
dotenv.config({ path: './Link.env' });

const dbName = process.env.DB_NAME || 'pi4_g5';
const dbUser = process.env.DB_USER || 'postgres';
const dbPass = process.env.DB_PASSWORD || 'SQL-Ranhoso123';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || 5432;

let sequelize;

if (process.env.USE_SQLITE === 'true') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../pi4_g5.sqlite'),
    logging: false
  });
} else {
  sequelize = new Sequelize(dbName, dbUser, dbPass, {
    host: dbHost,
    port: dbPort,
    dialect: 'postgres',
    logging: false
  });
}

// Suporte para fallback SQLite se o PostgreSQL não estiver a correr ou falhar autenticação
sequelize.authenticate().catch(err => {
  console.warn("⚠️ Não foi possível ligar ao PostgreSQL. A utilizar SQLite local (pi4_g5.sqlite)...");
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../pi4_g5.sqlite'),
    logging: false
  });
});

module.exports = sequelize;
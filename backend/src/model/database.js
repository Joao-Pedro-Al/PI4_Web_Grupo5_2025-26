const Sequelize = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();
dotenv.config({ path: './Link.env' });

let sequelize;

// Suporte à Connection String completa (DATABASE_URL ou DBConnLink do Neon/Render)
const connectionString = process.env.DATABASE_URL || process.env.DBConnLink;

if (connectionString) {
  sequelize = new Sequelize(connectionString, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  // Fallback para variáveis individuais (desenvolvimento local com PostgreSQL)
  const dbName = process.env.DB_NAME || 'pi4_g5';
  const dbUser = process.env.DB_USER || 'postgres';
  const dbPass = process.env.DB_PASSWORD || '';
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = process.env.DB_PORT || 5432;

  sequelize = new Sequelize(dbName, dbUser, dbPass, {
    host: dbHost,
    port: dbPort,
    dialect: 'postgres',
    logging: false
  });
}

module.exports = sequelize;
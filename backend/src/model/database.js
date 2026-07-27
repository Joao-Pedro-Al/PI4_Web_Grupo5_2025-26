var Sequelize = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();
dotenv.config({ path: './Link.env' });

const dbName = process.env.DB_NAME || 'pi4_g5';
const dbUser = process.env.DB_USER || 'postgres';
const dbPass = process.env.DB_PASSWORD || 'SQL-Ranhoso123';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || 5432;
const dbUrl = process.env.DATABASE_URL || process.env.DBConnLink;

let sequelize;

if (dbUrl && process.env.USE_REMOTE_DB === 'true') {
  sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false }
    }
  });
} else {
  sequelize = new Sequelize(dbName, dbUser, dbPass, {
    host: dbHost,
    port: dbPort,
    dialect: 'postgres',
    logging: false
  });
}

module.exports = sequelize;
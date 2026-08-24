const Sequelize = require('sequelize');
const dotenv = require('dotenv');
const { URL } = require('url');

dotenv.config();
dotenv.config({ path: './Link.env' });

function cleanConnectionString(raw) {
  if (!raw || typeof raw !== 'string') return null;
  let str = raw.trim();
  // Remover eventuais aspas simples ou duplas envolventes
  str = str.replace(/^['"`]+|['"`]+$/g, '').trim();
  // Se o utilizador tiver colado "DATABASE_URL=postgres..." ou "DBConnLink=..."
  if (str.includes('=') && !str.startsWith('postgres')) {
    const parts = str.split('=');
    str = parts.slice(1).join('=').trim().replace(/^['"`]+|['"`]+$/g, '').trim();
  }
  return str;
}

let sequelize;
const rawConn = cleanConnectionString(process.env.DATABASE_URL || process.env.DBConnLink);

if (rawConn && (rawConn.startsWith('postgres://') || rawConn.startsWith('postgresql://'))) {
  try {
    const parsed = new URL(rawConn);
    const dbName = (parsed.pathname ? parsed.pathname.replace(/^\//, '') : '') || 'neondb';
    const dbUser = decodeURIComponent(parsed.username || 'neondb_owner');
    const dbPass = decodeURIComponent(parsed.password || '');
    const dbHost = parsed.hostname;
    const dbPort = parsed.port ? parseInt(parsed.port, 10) : 5432;

    sequelize = new Sequelize(dbName, dbUser, dbPass, {
      host: dbHost,
      port: dbPort,
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    });
  } catch (err) {
    console.warn("Aviso ao analisar Connection String com new URL, a tentar ligação direta:", err.message);
    sequelize = new Sequelize(rawConn, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    });
  }
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
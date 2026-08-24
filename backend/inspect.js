const sequelize = require('./src/model/database');
const Consultas = require('./src/model/Consultas');

async function inspect() {
  try {
    const [cols] = await sequelize.query("PRAGMA table_info(consultas);");
    console.log("DB Columns:", cols);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

inspect();

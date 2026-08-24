const sequelize = require("./model/database");

// Importar todos os modelos
const Generos = require("./model/Generos");
const Estadocivil = require("./model/Estadocivil");
const Classe = require("./model/Classe");
const TipoConta = require("./model/tipoconta");
const TipoMarcacao = require("./model/tipomarcacao");
const Utilizadorperfil = require("./model/Utilizadorperfil");
const Conta = require("./model/Conta");
const Consultas = require("./model/Consultas");
const Notificacao = require("./model/Notificacao");
const Comprovativo = require("./model/Comprovativo");

async function syncDatabase() {
  try {
    console.log("🔄 Conectando à base de dados PostgreSQL...");
    await sequelize.authenticate();
    console.log("✅ Ligação estabelecida com sucesso!");

    console.log("🔄 Sincronizando tabelas com a base de dados...");
    await sequelize.sync({ alter: true });
    console.log("✅ Tabelas sincronizadas com sucesso!");

  } catch (error) {
    console.error("❌ Erro ao sincronizar a base de dados:", error);
  } finally {
    await sequelize.close();
  }
}

syncDatabase();

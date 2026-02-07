const Sequelize = require("sequelize");
const sequelize = require("./database");

const Utilizadorperfil = require('./Utilizadorperfil');
const TipoConta = require('./tipoconta');

const conta = sequelize.define(
  "conta",
  {
    idconta: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    nome: Sequelize.STRING,
    password: Sequelize.STRING,

    idtipoconta: {
      type: Sequelize.INTEGER,
      references: { model: TipoConta, key: "idtipoconta" },
    },

    idprefil: {
      type: Sequelize.INTEGER,
      references: { model: Utilizadorperfil, key: "idutilizadorprefil" },
    },
  },
  {
    timestamps: false,
    tableName: "conta", // opcional, mas ajuda a evitar confusões
    freezeTableName: true
  }
);

// Associações com FK explícita
conta.belongsTo(TipoConta, {
  as: 'TipoContaData',
  foreignKey: "idtipoconta",
});

conta.belongsTo(Utilizadorperfil, { 
  as: 'UtilizadorperfilData',
  foreignKey: "idprefil"
});

module.exports = conta;
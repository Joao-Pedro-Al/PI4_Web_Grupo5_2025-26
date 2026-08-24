// model/Notificacao.js (versão corrigida)
const Sequelize = require("sequelize");
const sequelize = require("./database");

const Notificacao = sequelize.define(
  "notificacao",
  {
    idnotificacao: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    prefil: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    titulo: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    descricao: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    visto: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    data_criacao: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    timestamps: false,
    freezeTableName: true,
    tableName: "notificacao"
  }
);

const Utilizadorperfil = require("./Utilizadorperfil");
Notificacao.belongsTo(Utilizadorperfil, {
  as: "PerfilData",
  foreignKey: "prefil",
  targetKey: "idutilizadorprefil"
});

module.exports = Notificacao;
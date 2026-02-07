const Sequelize = require("sequelize");
const sequelize = require("./database");

const TipoMarcacao = require("./tipomarcacao");
const Utilizadorperfil = require("./Utilizadorperfil");

const Consultas = sequelize.define(
  "consultas",
  {
    idconsulta: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    medico: Sequelize.STRING,
    hora: Sequelize.TIME,
    falta: Sequelize.BOOLEAN,
    estadimarcacao: Sequelize.BOOLEAN,
    numerotelemovel: Sequelize.NUMBER,

    tipomarcacao: {
      type: Sequelize.INTEGER,
      references: { model: TipoMarcacao, key: "idtipomarcacao" },
    },

    data: Sequelize.DATE,
    detalhes: Sequelize.STRING,
    guia_tratamento: Sequelize.STRING,

    idutilizadorprefil: {
      type: Sequelize.INTEGER,
      references: { model: Utilizadorperfil, key: "idutilizadorprefil" }, // <- confirma o nome real do PK em Classe
    },
  },
  {
    timestamps: false,
    tableName: "consultas", // opcional, mas ajuda a evitar confusões
    freezeTableName: true
  }
);

Consultas.belongsTo(TipoMarcacao, {
  as: "TipoMarcacaoData",
  foreignKey: "tipomarcacao"
});

Consultas.belongsTo(Utilizadorperfil, {
  as: "UtilizadorData",
  foreignKey: "idutilizadorprefil"
});

module.exports = Consultas;
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
    falta: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    estadimarcacao: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },
    numerotelemovel: Sequelize.STRING,

    tipomarcacao: {
      type: Sequelize.INTEGER,
      references: { model: TipoMarcacao, key: "idtipomarcacao" },
    },

    data: Sequelize.DATE,
    hora: Sequelize.STRING,    // Hora de início ex: "16:00:00"
    horaFim: {
      type: Sequelize.STRING,
      field: 'horafim'
    },
    detalhes: Sequelize.STRING,
    guia_tratamento: Sequelize.STRING,
    urgencia: {
      type: Sequelize.STRING,
      defaultValue: "Normal"
    },
    acompanhante: Sequelize.STRING,

    idutilizadorprefil: {
      type: Sequelize.INTEGER,
      references: { model: Utilizadorperfil, key: "idutilizadorprefil" },
    },
  },
  {
    timestamps: false,
    tableName: "consultas",
    freezeTableName: true
  }
);

Consultas.belongsTo(TipoMarcacao, {
  as: "TipoMarcacaoData",
  foreignKey: "tipomarcacao"
});

Consultas.belongsTo(Utilizadorperfil, {
  as: "UtilizadorData",
  foreignKey: "idutilizadorprefil",
  targetKey: "idutilizadorprefil"
});

module.exports = Consultas;
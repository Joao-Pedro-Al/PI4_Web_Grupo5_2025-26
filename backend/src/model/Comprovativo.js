const Sequelize = require("sequelize");
const sequelize = require("./database");

const Consultas = require("./Consultas");
const Utilizadorperfil = require("./Utilizadorperfil");

const Comprovativo = sequelize.define(
  "comprovativo",
  {
    idcomprovativo: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    idconsulta: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: Consultas, key: "idconsulta" },
    },
    idutilizadorprefil: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: Utilizadorperfil, key: "idutilizadorprefil" },
    },
    tipo_documento: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    titulo: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    ficheiro_path: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    valor: {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    data_emissao: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    timestamps: false,
    tableName: "comprovativo",
    freezeTableName: true,
  }
);

Comprovativo.belongsTo(Consultas, {
  as: "ConsultaData",
  foreignKey: "idconsulta",
});

Comprovativo.belongsTo(Utilizadorperfil, {
  as: "UtilizadorData",
  foreignKey: "idutilizadorprefil",
});

module.exports = Comprovativo;

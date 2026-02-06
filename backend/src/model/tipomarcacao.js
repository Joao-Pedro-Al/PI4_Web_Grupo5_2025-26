var Sequelize = require("sequelize");
var sequelize = require("./database");
var TipoMarcacao = sequelize.define(
  "tipomarcacao",
  {
    idtipomarcacao: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'idtipomarcacao'
    },
    designacao: Sequelize.STRING,
  },
  {
    timestamps: false,
    tableName: "tipomarcacao",
    freezeTableName: true
  }
);
module.exports = TipoMarcacao;

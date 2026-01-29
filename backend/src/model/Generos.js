var Sequelize = require("sequelize");
var sequelize = require("./database");
var Generos = sequelize.define(
  "generos",
  {
    idgenero: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'idgenero'
    },
    designacao: Sequelize.STRING,
  },
  {
    timestamps: false,
    freezeTableName: true
  }
);
module.exports = Generos;

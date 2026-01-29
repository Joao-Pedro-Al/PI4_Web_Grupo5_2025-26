var Sequelize = require("sequelize");
var sequelize = require("./database");
var Classe = sequelize.define(
  "classe",
  {
    idclasse: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'idclasse'
    },
    designacao: Sequelize.STRING,
  },
  {
    timestamps: false,
    freezeTableName: true
  }
);
module.exports = Classe;

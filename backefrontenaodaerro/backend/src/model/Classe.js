var Sequelize = require("sequelize");
var sequelize = require("./database");
var Classe = sequelize.define(
  "classe",
  {
    classe: Sequelize.STRING,
  },
  {
    timestamps: false,
  }
);
module.exports = Classe;

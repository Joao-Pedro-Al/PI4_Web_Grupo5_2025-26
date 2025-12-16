var Sequelize = require("sequelize");
var sequelize = require("./database");
var Estadocivil = sequelize.define(
  "estadocivil",
  {
    estadocivil: Sequelize.STRING,
  },
  {
    timestamps: false,
  }
);
module.exports = Estadocivil;

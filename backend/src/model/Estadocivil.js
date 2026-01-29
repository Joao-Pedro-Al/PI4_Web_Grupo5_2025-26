var Sequelize = require("sequelize");
var sequelize = require("./database");
var Estadocivil = sequelize.define(
  "estadocivil",
  {
    idestadocivil: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'idestadocivil'
    },
    designacao: Sequelize.STRING,
  },
  {
    timestamps: false,
    freezeTableName: true
  }
);
module.exports = Estadocivil;

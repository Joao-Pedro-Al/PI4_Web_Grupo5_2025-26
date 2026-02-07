var Sequelize = require("sequelize");
var sequelize = require("./database");
var TipoConta = sequelize.define(
  "tipoconta",
  {
    idtipoconta: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'idtipoconta'
    },
    desling: Sequelize.STRING,
  },
  {
    timestamps: false,
    tableName: "tipoconta",
    freezeTableName: true
  }
);
module.exports = TipoConta;

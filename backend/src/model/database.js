var Sequelize = require('sequelize');
const sequelize = new Sequelize(
'basededadosPe',//nome da vossa base de dados
'postgres',
'DaNstUP534',//metam a vossa password
{
host: 'localhost',
port: '5432',
dialect: 'postgres'
}
);

module.exports = sequelize;
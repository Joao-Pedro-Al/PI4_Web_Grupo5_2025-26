var Sequelize = require('sequelize');
const sequelize = new Sequelize(
'pi4_g5',//nome da vossa base de dados
'postgres',
'dsC424282',//metam a vossa password
{
host: 'localhost',
port: '5432',
dialect: 'postgres'
}
);
module.exports = sequelize;
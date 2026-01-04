var Sequelize = require('sequelize');
const sequelize = new Sequelize(
'backend1',//nome da vossa base de dados
'postgres',
'',//metam a vossa password
{
host: 'localhost',
port: '5432',
dialect: 'postgres'
}
);
module.exports = sequelize;
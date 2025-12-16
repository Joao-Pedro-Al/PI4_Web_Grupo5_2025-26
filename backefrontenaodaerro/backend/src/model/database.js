var Sequelize = require('sequelize');
const sequelize = new Sequelize(
'backend1',
'postgres',
'DaNstUP534',//metam a vossa password
{
host: 'localhost',
port: '5432',
dialect: 'postgres'
}
);
module.exports = sequelize;
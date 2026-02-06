var Sequelize = require("sequelize");
var sequelize = require("./database");
var ViewPerfilCompleto = sequelize.define(
  "listarperfiscompletos",
  {
    idperfil:{
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    iddependente: Sequelize.INTEGER,
    nome: Sequelize.STRING,
    datanascimento: Sequelize.DATEONLY,
    genero: Sequelize.STRING,
    endereco: Sequelize.STRING,
    contactoprincipal: Sequelize.NUMBER,
    contactosecundario: Sequelize.NUMBER,
    nif: Sequelize.NUMBER,
    estadocivil: Sequelize.STRING,
    profissao: Sequelize.STRING,
    numeroutente: Sequelize.NUMBER,
    subsistemassaude: Sequelize.STRING,
    gmail: Sequelize.STRING,
    motivoconsultainicial: Sequelize.STRING,
    condicoesdentarias: Sequelize.STRING,
    historicotratamentosdentariospassados: Sequelize.STRING,
    experienciaanastesia: Sequelize.BOOLEAN,
    historicodor: Sequelize.BOOLEAN,
    condicaosaude: Sequelize.STRING,
    alergias: Sequelize.STRING,
    medicamentos: Sequelize.STRING,
    gravida: Sequelize.BOOLEAN,
    habitoigieneoral: Sequelize.STRING,
    habitosalimentares: Sequelize.STRING,
    consumosubstancia: Sequelize.STRING,
    bruxismo: Sequelize.BOOLEAN,
    atividadesdesportivas: Sequelize.STRING
  },
  {
    tableName: 'listarperfiscompletos',
    schema: 'public',
    timestamps: false,
    freezeTableName: true
  }
);
module.exports = ViewPerfilCompleto;

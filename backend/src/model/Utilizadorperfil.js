const Sequelize = require("sequelize");
const sequelize = require("./database");

const Estadocivil = require("./Estadocivil");
const Generos = require("./Generos");
const Classe = require("./Classe");

const Utilizadorperfil = sequelize.define(
  "utilizadorprefil",
  {
    idutilizadorprefil: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // FK para o próprio modelo (ex: "pai"/"responsável"/"referência")
    posidutilizador: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "utilizadorprefil",      // <- aponta para a tabela utilizadorprefil
        key: "idutilizadorprefil",      // <- aponta ao PK
      },
    },

    nome: Sequelize.STRING,
    datanascimento: Sequelize.DATEONLY,

    genero: {
      type: Sequelize.INTEGER,
      references: { model: Generos, key: "idgenero" },
    },

    endereco: Sequelize.STRING,

    contactoprincipal: Sequelize.STRING,
    contactosecundario: Sequelize.STRING,
    nif: Sequelize.STRING,

    estadocivil: {
      type: Sequelize.INTEGER,
      references: { model: Estadocivil, key: "idestadocivil" },
    },

    profissao: Sequelize.STRING,
    numeroutente: Sequelize.STRING,
    subsistemassaude: Sequelize.STRING,
    gmail: Sequelize.STRING,

    classe: {
      type: Sequelize.INTEGER,
      references: { model: Classe, key: "idclasse" },
    },

    // Campos de Histórico Médico & Dentário
    alergias: Sequelize.STRING,
    medicamentos: Sequelize.STRING,
    condicaosaude: Sequelize.STRING,
    motivoconsultainicial: Sequelize.STRING,
    experienciaanastesia: Sequelize.BOOLEAN,
    condicoesdentarias: Sequelize.STRING,
    habitoigieneoral: Sequelize.STRING,
    consumosubstancia: Sequelize.STRING,
    historicotratamentosdentariospassados: Sequelize.TEXT,
    historicodor: Sequelize.BOOLEAN,
    atividadesdesportivas: Sequelize.STRING,
    bruxismo: Sequelize.STRING,
    gravida: Sequelize.BOOLEAN,
    infoadicional: Sequelize.TEXT,
    resultadosanteriores: Sequelize.TEXT,

    // Guarda um array JSON com os nomes dos ficheiros anexados (exames, raios-x, etc.)
    ficheirosanexos: Sequelize.TEXT,
  },
  {
    timestamps: false,
    tableName: "utilizadorprefil",
    freezeTableName: true
  }
);

// Associações com FK explícita
Utilizadorperfil.belongsTo(Classe, {
  as: 'classeData',
  foreignKey: "classe",
  // targetKey: "idclasse"
});

Utilizadorperfil.belongsTo(Estadocivil, { 
  as: 'estadocivilData',
  foreignKey: "estadocivil",
  // targetKey: "idestadocivil"
});

Utilizadorperfil.belongsTo(Generos, {
  as: "generoData",
  foreignKey: "genero",
  // targetKey: "idgenero"
});

// self association
Utilizadorperfil.belongsTo(Utilizadorperfil, {
  as: "posUtilizador",
  foreignKey: "posidutilizador",
  // targetKey: "idutilizadorprefil"
});

module.exports = Utilizadorperfil;
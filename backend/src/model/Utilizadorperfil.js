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
        model: "utilizadorperfil",      // <- usa o nome da tabela/modelo (string)
        key: "idutilizadorperfil",      // <- aponta ao PK
      },
    },

    nome: Sequelize.STRING,
    datanascimento: Sequelize.DATE,

    genero: {
      type: Sequelize.INTEGER,
      references: { model: Generos, key: "idgenero" },
    },

    endereco: Sequelize.STRING,

    contactoprincipal: Sequelize.INTEGER,
    contactosecundario: Sequelize.INTEGER,
    nif: Sequelize.INTEGER,

    estadocivil: {
      type: Sequelize.INTEGER,
      references: { model: Estadocivil, key: "idestadocivil" },
    },

    profissao: Sequelize.STRING,
    numeroutente: Sequelize.INTEGER,
    subsistemassaude: Sequelize.STRING,
    gmail: Sequelize.STRING,

    classe: {
      type: Sequelize.INTEGER,
      references: { model: Classe, key: "idclasse" }, // <- confirma o nome real do PK em Classe
    },
  },
  {
    timestamps: false,
    tableName: "utilizadorprefil", // opcional, mas ajuda a evitar confusões
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
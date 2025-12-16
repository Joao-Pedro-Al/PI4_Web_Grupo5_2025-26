const Sequelize = require("sequelize");
const sequelize = require("./database");

const Estadocivil = require("./Estadocivil");
const Generos = require("./Generos");
const Classe = require("./Classe");

const Utilizadorperfil = sequelize.define(
  "utilizadorperfil",
  {
    idutilizadorperfil: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // FK para o próprio modelo (ex: "pai"/"responsável"/"referência")
    idposIdutilizador: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "utilizadorperfil",      // <- usa o nome da tabela/modelo (string)
        key: "idutilizadorperfil",      // <- aponta ao PK
      },
    },

    nome: Sequelize.STRING,
    datanascimento: Sequelize.DATE,

    generoId: {
      type: Sequelize.INTEGER,
      references: { model: Generos, key: "id" },
    },

    enderco: Sequelize.STRING,

    contactoprincipal: Sequelize.INTEGER,
    contactosecundario: Sequelize.INTEGER,
    nif: Sequelize.INTEGER,

    estadocivilId: {
      type: Sequelize.INTEGER,
      references: { model: Estadocivil, key: "id" },
    },

    profissao: Sequelize.STRING,
    numeroutente: Sequelize.INTEGER,
    subsistemasaude: Sequelize.STRING,
    email: Sequelize.STRING,

    classeId: {
      type: Sequelize.INTEGER,
      references: { model: Classe, key: "id" }, // <- confirma o nome real do PK em Classe
    },
  },
  {
    timestamps: false,
    tableName: "utilizadorperfil", // opcional, mas ajuda a evitar confusões
  }
);

// Associações com FK explícita
Utilizadorperfil.belongsTo(Classe, { foreignKey: "classeId" });
Utilizadorperfil.belongsTo(Estadocivil, { foreignKey: "estadocivilId" });
Utilizadorperfil.belongsTo(Generos, { foreignKey: "generoId" });

// self association
Utilizadorperfil.belongsTo(Utilizadorperfil, {
  as: "posUtilizador",
  foreignKey: "idposIdutilizador",
});

module.exports = Utilizadorperfil;
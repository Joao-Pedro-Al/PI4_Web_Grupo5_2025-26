var Utilizadorperfil = require("../model/Utilizadorperfil");
var Generos = require("../model/Generos");
var Classe = require("../model/Classe");
var Estadocivil = require("../model/Estadocivil");
var sequelize = require("../model/database");
const controllers = {};
sequelize.sync();

controllers.testdata = async (req, res) => {
  const response = await sequelize
    .sync()
    .then(function () {
      //Cria Role
      Generos.create({
        generos: "femenino",
      });
      Classe.create({
        classe: "medico",
      });
      Estadocivil.create({
        estadocivil: "solteiro",
      });
      // Cria employee
      Utilizadorperfil.create({
        name: "Nuno Costa",
        email: "ncosta@estgv.ipv.pt",
        address: "Campus Politécnico, Viseu, Portugal",
        phone: "232480533",
        generoId: 1,
        classeId: 1,
        estadocivilId: 1,
      });

      Utilizadorperfil.create({
        name: "Luis Costa",
        email: "ncosta@estgv.ipv.pt",
        address: "Campus Politécnico, Viseu, Portugal",
        phone: "232480533",
        generoId: 1,
        classeId: 1,
        estadocivilId: 1,
      });

      const data = Utilizadorperfil.findAll();
      return data;
    })
    .catch((err) => {
      return err;
    });
  res.json(response);
};
controllers.list = async (req, res) => {
  const data = await Utilizadorperfil.findAll();
  res.json(data);
};
module.exports = controllers;

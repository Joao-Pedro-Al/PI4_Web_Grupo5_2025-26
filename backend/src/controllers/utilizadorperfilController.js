var Utilizadorperfil = require("../model/Utilizadorperfil");
var Generos = require("../model/Generos");
var Classe = require("../model/Classe");
var Estadocivil = require("../model/Estadocivil");
var ViewPerfilCompleto = require("../model/ViewPerfilCompleto");
var sequelize = require("../model/database");
const controllers = {};
// sequelize.sync();

// controllers.testdata = async (req, res) => {
//   const response = await sequelize
//     .sync()
//     .then(function () {
//       //Cria Role
//       Generos.create({
//         generos: "femenino",
//       });
//       Classe.create({
//         classe: "medico",
//       });
//       Estadocivil.create({
//         estadocivil: "solteiro",
//       });
//       // Cria employee
//       Utilizadorperfil.create({
//         name: "Nuno Costa",
//         email: "ncosta@estgv.ipv.pt",
//         address: "Campus Politécnico, Viseu, Portugal",
//         phone: "232480533",
//         generoId: 1,
//         classeId: 1,
//         estadocivilId: 1,
//       });

//       Utilizadorperfil.create({
//         name: "Luis Costa",
//         email: "ncosta@estgv.ipv.pt",
//         address: "Campus Politécnico, Viseu, Portugal",
//         phone: "232480533",
//         generoId: 1,
//         classeId: 1,
//         estadocivilId: 1,
//       });

//       const data = Utilizadorperfil.findAll();
//       return data;
//     })
//     .catch((err) => {
//       return err;
//     });
//   res.json(response);
// };
controllers.list = async (req, res) => {
  try {
    const data = await Utilizadorperfil.findAll({
      include: [
        { model: Generos, as: 'generoData' },
        { model: Classe, as: 'classeData' },
        { model: Estadocivil, as: 'estadocivilData' }
      ]
    });
    res.json({success: true, data: data});
  } catch (error) {
    console.error("Erro durante a listagem:", error);
    res.status(500).json({ error: error.message });
  }
};

controllers.listPerfilInteiro = async (req, res) => {
  try {
    const {id} = req.params;
    const data = await ViewPerfilCompleto.findAll({
      where: {idperfil: id}
    });
    res.json({success: true, data: data});
  } catch (error) {
    console.error("Erro durante a listagem:", error);
    res.status(500).json({ error: error.message });
  }
};
module.exports = controllers;

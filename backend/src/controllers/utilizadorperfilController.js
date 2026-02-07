var Utilizadorperfil = require("../model/Utilizadorperfil");
var Generos = require("../model/Generos");
var Classe = require("../model/Classe");
var Estadocivil = require("../model/Estadocivil");
var ViewPerfilCompleto = require("../model/ViewPerfilCompleto");
var TipoConta = require("../model/tipoconta");
var Conta = require("../model/Conta");
var sequelize = require("../model/database");
const controllers = {};
// sequelize.sync();

controllers.create = async (req, res) => {
  const { 
    nome, gmail, nif, profissao, datanascimento,
    idgenero, idestadocivil, idclasse 
  } = req.body;

  try {
    const data = await Utilizadorperfil.create({
      nome: nome,
      gmail: gmail,
      nif: nif,
      profissao: profissao,
      datanascimento: datanascimento,
      // Estes nomes à esquerda têm de ser IGUAIS ao modelo acima
      genero: Number(idgenero), 
      estadocivil: Number(idestadocivil),
      classe: Number(idclasse)
    });

    res.json({ success: true, message: "Registado!", data: data });
  } catch (error) {
    console.log("Erro detalhado: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

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

controllers.criarconta = async (req, res) => {
  const { 
    nome, email, tipoconta 
  } = req.body;

  const tamanhoPass = Math.floor(Math.random() * 10) + 10;

  try {
    const prefil = await Utilizadorperfil.findAll({
      include: [
        { model: Generos, as: 'generoData' },
        { model: Classe, as: 'classeData' },
        { model: Estadocivil, as: 'estadocivilData' }
      ],
      where: {gmail: email}
    });
    const idpre = prefil.idutilizadorprefil;
    const data = await Conta.create({
      nome: nome,
      password: GerarPassword(tamanhoPass),
      idtipoconta: Number(tipoconta), 
      idprefil: Number(idpre)
    });

    res.json({ success: true, message: "Registado!", data: data });
  } catch (error) {
    console.log("Erro detalhado: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

function GerarPassword(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

module.exports = controllers;

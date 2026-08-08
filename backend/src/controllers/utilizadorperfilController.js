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
  try {
    const { 
      nome, gmail, email, nif, profissao, datanascimento,
      idgenero, genero, idestadocivil, estadocivil, idclasse, classe,
      contactoprincipal, contactosecundario, endereco, numeroutente, subsistemassaude,
      alergias, medicamentos, 
      condicoesSaude, condicaosaude,
      motivoConsulta, motivoconsultainicial,
      anestesiaLocal, experienciaanastesia,
      condicoesDentariasPre, detalhesPreExistentes, condicoesdentarias,
      habitosHigieneOral, habitoigieneoral,
      consumoSubstancias, detalhesSubstancias, consumosubstancia,
      historicoTratamentos, historicotratamentosdentariospassados,
      dorSensibilidade, historicodor,
      atividadesDesportivas, atividadesdesportivas,
      tipoBruxismo, bruxismo,
      gravidez, gravida,
      infoAdicional, infoadicional,
      resultadosAnteriores, resultadosanteriores
    } = req.body;

    // req.files vem do multer (upload.array('ficheiros', 10) na rota).
    // Guardamos só os nomes gerados no disco, como array JSON em texto.
    const ficheirosanexos = (req.files && req.files.length > 0)
      ? JSON.stringify(req.files.map(f => f.filename))
      : null;

    const data = await Utilizadorperfil.create({
      nome: nome,
      gmail: gmail || email,
      nif: nif ? String(nif) : null,
      profissao: profissao || null,
      datanascimento: datanascimento || null,
      genero: idgenero ? Number(idgenero) : (genero ? Number(genero) : null), 
      estadocivil: idestadocivil ? Number(idestadocivil) : (estadocivil ? Number(estadocivil) : null),
      classe: idclasse ? Number(idclasse) : (classe ? Number(classe) : null),
      contactoprincipal: contactoprincipal ? String(contactoprincipal) : null,
      contactosecundario: contactosecundario ? String(contactosecundario) : null,
      endereco: endereco || null,
      numeroutente: numeroutente ? String(numeroutente) : null,
      subsistemassaude: subsistemassaude || null,
      alergias: alergias || null,
      medicamentos: medicamentos || null,
      condicaosaude: condicoesSaude || condicaosaude || null,
      motivoconsultainicial: motivoConsulta || motivoconsultainicial || null,
      experienciaanastesia: Boolean(anestesiaLocal ?? experienciaanastesia),
      condicoesdentarias: detalhesPreExistentes || condicoesdentarias || (condicoesDentariasPre ? "Sim" : null),
      habitoigieneoral: habitosHigieneOral || habitoigieneoral || null,
      consumosubstancia: detalhesSubstancias || consumosubstancia || (consumoSubstancias ? "Sim" : null),
      historicotratamentosdentariospassados: historicoTratamentos || historicotratamentosdentariospassados || null,
      historicodor: Boolean(dorSensibilidade ?? historicodor),
      atividadesdesportivas: atividadesDesportivas || atividadesdesportivas || null,
      bruxismo: tipoBruxismo || bruxismo || null,
      gravida: Boolean(gravidez ?? gravida),
      infoadicional: infoAdicional || infoadicional || null,
      resultadosanteriores: resultadosAnteriores || resultadosanteriores || null,
      ficheirosanexos: ficheirosanexos
    });

    res.json({ 
      success: true, 
      message: "Perfil criado com sucesso!", 
      data: data 
    });
  } catch (error) {
    console.error("Erro detalhado na criação de perfil: ", error);
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
    const data = await Utilizadorperfil.findAll({
      include: [
        { model: Generos, as: 'generoData' },
        { model: Classe, as: 'classeData' },
        { model: Estadocivil, as: 'estadocivilData' }
      ],
      where: {idutilizadorprefil: id}
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
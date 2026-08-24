var Utilizadorperfil = require("../model/Utilizadorperfil");
var Generos = require("../model/Generos");
var Classe = require("../model/Classe");
var Estadocivil = require("../model/Estadocivil");
var ViewPerfilCompleto = require("../model/ViewPerfilCompleto");
var TipoConta = require("../model/tipoconta");
var Conta = require("../model/Conta");
var sequelize = require("../model/database");
const controllers = {};

// Criar perfil de utilizador
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
      resultadosAnteriores, resultadosanteriores,
      posidutilizador, posIdUtilizador
    } = req.body;

    const idResponsavel = posidutilizador || posIdUtilizador;

    const ficheirosanexos = (req.files && req.files.length > 0)
      ? JSON.stringify(req.files.map(f => f.filename))
      : null;

    const data = await Utilizadorperfil.create({
      posidutilizador: (idResponsavel && idResponsavel !== "null" && idResponsavel !== "undefined") ? Number(idResponsavel) : null,
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

// Listar todos os perfis
controllers.list = async (req, res) => {
  try {
    const data = await Utilizadorperfil.findAll({
      include: [
        { model: Generos, as: 'generoData' },
        { model: Classe, as: 'classeData' },
        { model: Estadocivil, as: 'estadocivilData' },
        { model: Utilizadorperfil, as: 'posUtilizador', attributes: ['idutilizadorprefil', 'nome', 'contactoprincipal', 'gmail'] }
      ]
    });
    res.json({ success: true, data: data });
  } catch (error) {
    console.error("Erro durante a listagem:", error);
    res.status(500).json({ error: error.message });
  }
};

// Obter perfil completo por ID
controllers.listPerfilInteiro = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Utilizadorperfil.findAll({
      include: [
        { model: Generos, as: 'generoData' },
        { model: Classe, as: 'classeData' },
        { model: Estadocivil, as: 'estadocivilData' },
        { model: Utilizadorperfil, as: 'posUtilizador', attributes: ['idutilizadorprefil', 'nome', 'contactoprincipal', 'gmail'] }
      ],
      where: { idutilizadorprefil: id }
    });
    res.json({ success: true, data: data });
  } catch (error) {
    console.error("Erro durante a listagem:", error);
    res.status(500).json({ error: error.message });
  }
};

// Listar dependentes (crianças/educandos) de um perfil responsável
controllers.listDependentes = async (req, res) => {
  try {
    const { id } = req.params;
    const dependentes = await Utilizadorperfil.findAll({
      where: { posidutilizador: Number(id) },
      include: [
        { model: Generos, as: 'generoData' },
        { model: Classe, as: 'classeData' }
      ]
    });
    res.json({ success: true, data: dependentes });
  } catch (error) {
    console.error("Erro ao listar dependentes:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Atualizar perfil de utilizador
controllers.update = async (req, res) => {
  try {
    const { id } = req.params;
    const perfil = await Utilizadorperfil.findByPk(id);

    if (!perfil) {
      return res.status(404).json({ success: false, message: "Perfil não encontrado." });
    }

    const {
      nome, gmail, email, nif, profissao, datanascimento,
      idgenero, genero, idestadocivil, estadocivil, idclasse, classe,
      contactoprincipal, contactosecundario, endereco, numeroutente, subsistemassaude,
      alergias, medicamentos, condicoesSaude, condicaosaude,
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
      resultadosAnteriores, resultadosanteriores,
      posidutilizador, posIdUtilizador
    } = req.body;

    const idResponsavel = posidutilizador || posIdUtilizador;

    await perfil.update({
      nome: nome !== undefined ? nome : perfil.nome,
      gmail: (gmail || email) !== undefined ? (gmail || email) : perfil.gmail,
      nif: nif !== undefined ? (nif ? String(nif) : null) : perfil.nif,
      profissao: profissao !== undefined ? profissao : perfil.profissao,
      datanascimento: datanascimento !== undefined ? datanascimento : perfil.datanascimento,
      genero: idgenero ? Number(idgenero) : (genero ? Number(genero) : perfil.genero),
      estadocivil: idestadocivil ? Number(idestadocivil) : (estadocivil ? Number(estadocivil) : perfil.estadocivil),
      classe: idclasse ? Number(idclasse) : (classe ? Number(classe) : perfil.classe),
      contactoprincipal: contactoprincipal !== undefined ? (contactoprincipal ? String(contactoprincipal) : null) : perfil.contactoprincipal,
      contactosecundario: contactosecundario !== undefined ? (contactosecundario ? String(contactosecundario) : null) : perfil.contactosecundario,
      endereco: endereco !== undefined ? endereco : perfil.endereco,
      numeroutente: numeroutente !== undefined ? (numeroutente ? String(numeroutente) : null) : perfil.numeroutente,
      subsistemassaude: subsistemassaude !== undefined ? subsistemassaude : perfil.subsistemassaude,
      alergias: alergias !== undefined ? alergias : perfil.alergias,
      medicamentos: medicamentos !== undefined ? medicamentos : perfil.medicamentos,
      condicaosaude: (condicoesSaude || condicaosaude) !== undefined ? (condicoesSaude || condicaosaude) : perfil.condicaosaude,
      motivoconsultainicial: (motivoConsulta || motivoconsultainicial) !== undefined ? (motivoConsulta || motivoconsultainicial) : perfil.motivoconsultainicial,
      experienciaanastesia: experienciaanastesia !== undefined ? Boolean(experienciaanastesia) : (anestesiaLocal !== undefined ? Boolean(anestesiaLocal) : perfil.experienciaanastesia),
      condicoesdentarias: (detalhesPreExistentes || condicoesdentarias) !== undefined ? (detalhesPreExistentes || condicoesdentarias) : perfil.condicoesdentarias,
      habitoigieneoral: (habitosHigieneOral || habitoigieneoral) !== undefined ? (habitosHigieneOral || habitoigieneoral) : perfil.habitoigieneoral,
      consumosubstancia: (detalhesSubstancias || consumosubstancia) !== undefined ? (detalhesSubstancias || consumosubstancia) : perfil.consumosubstancia,
      historicotratamentosdentariospassados: (historicoTratamentos || historicotratamentosdentariospassados) !== undefined ? (historicoTratamentos || historicotratamentosdentariospassados) : perfil.historicotratamentosdentariospassados,
      historicodor: historicodor !== undefined ? Boolean(historicodor) : (dorSensibilidade !== undefined ? Boolean(dorSensibilidade) : perfil.historicodor),
      atividadesdesportivas: (atividadesDesportivas || atividadesdesportivas) !== undefined ? (atividadesDesportivas || atividadesdesportivas) : perfil.atividadesdesportivas,
      bruxismo: (tipoBruxismo || bruxismo) !== undefined ? (tipoBruxismo || bruxismo) : perfil.bruxismo,
      gravida: gravida !== undefined ? Boolean(gravida) : (gravidez !== undefined ? Boolean(gravidez) : perfil.gravida),
      infoadicional: (infoAdicional || infoadicional) !== undefined ? (infoAdicional || infoadicional) : perfil.infoadicional,
      resultadosanteriores: (resultadosAnteriores || resultadosanteriores) !== undefined ? (resultadosAnteriores || resultadosanteriores) : perfil.resultadosanteriores,
      posidutilizador: idResponsavel !== undefined ? (idResponsavel && idResponsavel !== "null" && idResponsavel !== "undefined" ? Number(idResponsavel) : null) : perfil.posidutilizador
    });

    const perfilAtualizado = await Utilizadorperfil.findByPk(id, {
      include: [
        { model: Generos, as: 'generoData' },
        { model: Classe, as: 'classeData' },
        { model: Estadocivil, as: 'estadocivilData' },
        { model: Utilizadorperfil, as: 'posUtilizador', attributes: ['idutilizadorprefil', 'nome', 'contactoprincipal', 'gmail'] }
      ]
    });

    res.json({
      success: true,
      message: "Perfil atualizado com sucesso!",
      data: perfilAtualizado
    });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Eliminar perfil de utilizador
controllers.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const perfil = await Utilizadorperfil.findByPk(id);

    if (!perfil) {
      return res.status(404).json({ success: false, message: "Perfil não encontrado." });
    }

    await perfil.destroy();

    res.json({
      success: true,
      message: "Perfil eliminado com sucesso!"
    });
  } catch (error) {
    console.error("Erro ao eliminar perfil:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

controllers.criarconta = async (req, res) => {
  const { nome, email, tipoconta } = req.body;
  const tamanhoPass = Math.floor(Math.random() * 10) + 10;

  try {
    const prefil = await Utilizadorperfil.findAll({
      where: { gmail: email }
    });
    const idpre = prefil.length > 0 ? prefil[0].idutilizadorprefil : null;
    const data = await Conta.create({
      nome: nome,
      password: GerarPassword(tamanhoPass),
      idtipoconta: Number(tipoconta), 
      idprefil: idpre ? Number(idpre) : null
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
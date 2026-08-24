var Utilizadorperfil = require("../model/Utilizadorperfil");
var Generos = require("../model/Generos");
var Classe = require("../model/Classe");
var Estadocivil = require("../model/Estadocivil");
var ViewPerfilCompleto = require("../model/ViewPerfilCompleto");
var TipoConta = require("../model/tipoconta");
var Conta = require("../model/Conta");
var Consultas = require("../model/Consultas");
var Notificacao = require("../model/Notificacao");
var Comprovativo = require("../model/Comprovativo");
var sequelize = require("../model/database");
const controllers = {};

const parseIntegerOrNull = (val) => {
  if (val === null || val === undefined || val === "" || val === "null" || val === "undefined") return null;
  const num = parseInt(val, 10);
  return isNaN(num) ? null : num;
};

const parseBooleanSafe = (val) => {
  if (val === true || val === "true" || val === 1 || val === "1") return true;
  return false;
};

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
      posidutilizador: parseIntegerOrNull(idResponsavel),
      nome: nome || 'Sem Nome',
      gmail: (gmail || email) ? String(gmail || email).trim() : null,
      nif: nif ? String(nif).trim() : null,
      profissao: profissao ? String(profissao).trim() : null,
      datanascimento: datanascimento ? String(datanascimento).trim() : null,
      genero: parseIntegerOrNull(idgenero || genero),
      estadocivil: parseIntegerOrNull(idestadocivil || estadocivil),
      classe: parseIntegerOrNull(idclasse || classe) || 1, // Default classe 1 (Geral / Paciente)
      contactoprincipal: contactoprincipal ? String(contactoprincipal).trim() : null,
      contactosecundario: contactosecundario ? String(contactosecundario).trim() : null,
      endereco: endereco ? String(endereco).trim() : null,
      numeroutente: numeroutente ? String(numeroutente).trim() : null,
      subsistemassaude: subsistemassaude ? String(subsistemassaude).trim() : null,
      alergias: alergias || null,
      medicamentos: medicamentos || null,
      condicaosaude: condicoesSaude || condicaosaude || null,
      motivoconsultainicial: motivoConsulta || motivoconsultainicial || null,
      experienciaanastesia: parseBooleanSafe(anestesiaLocal ?? experienciaanastesia),
      condicoesdentarias: detalhesPreExistentes || condicoesdentarias || (condicoesDentariasPre ? "Sim" : null),
      habitoigieneoral: habitosHigieneOral || habitoigieneoral || null,
      consumosubstancia: detalhesSubstancias || consumosubstancia || (consumoSubstancias ? "Sim" : null),
      historicotratamentosdentariospassados: historicoTratamentos || historicotratamentosdentariospassados || null,
      historicodor: parseBooleanSafe(dorSensibilidade ?? historicodor),
      atividadesdesportivas: atividadesDesportivas || atividadesdesportivas || null,
      bruxismo: tipoBruxismo || bruxismo || null,
      gravida: parseBooleanSafe(gravidez ?? gravida),
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

// Listar dependentes associados a um perfil responsável
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
      nome: nome !== undefined ? (nome ? String(nome).trim() : perfil.nome) : perfil.nome,
      gmail: (gmail || email) !== undefined ? ((gmail || email) ? String(gmail || email).trim() : null) : perfil.gmail,
      nif: nif !== undefined ? (nif ? String(nif).trim() : null) : perfil.nif,
      profissao: profissao !== undefined ? (profissao ? String(profissao).trim() : null) : perfil.profissao,
      datanascimento: datanascimento !== undefined ? (datanascimento ? String(datanascimento).trim() : null) : perfil.datanascimento,
      genero: parseIntegerOrNull(idgenero || genero) !== null ? parseIntegerOrNull(idgenero || genero) : perfil.genero,
      estadocivil: parseIntegerOrNull(idestadocivil || estadocivil) !== null ? parseIntegerOrNull(idestadocivil || estadocivil) : perfil.estadocivil,
      classe: parseIntegerOrNull(idclasse || classe) !== null ? parseIntegerOrNull(idclasse || classe) : perfil.classe,
      contactoprincipal: contactoprincipal !== undefined ? (contactoprincipal ? String(contactoprincipal).trim() : null) : perfil.contactoprincipal,
      contactosecundario: contactosecundario !== undefined ? (contactosecundario ? String(contactosecundario).trim() : null) : perfil.contactosecundario,
      endereco: endereco !== undefined ? (endereco ? String(endereco).trim() : null) : perfil.endereco,
      numeroutente: numeroutente !== undefined ? (numeroutente ? String(numeroutente).trim() : null) : perfil.numeroutente,
      subsistemassaude: subsistemassaude !== undefined ? (subsistemassaude ? String(subsistemassaude).trim() : null) : perfil.subsistemassaude,
      alergias: alergias !== undefined ? alergias : perfil.alergias,
      medicamentos: medicamentos !== undefined ? medicamentos : perfil.medicamentos,
      condicaosaude: (condicoesSaude || condicaosaude) !== undefined ? (condicoesSaude || condicaosaude) : perfil.condicaosaude,
      motivoconsultainicial: (motivoConsulta || motivoconsultainicial) !== undefined ? (motivoConsulta || motivoconsultainicial) : perfil.motivoconsultainicial,
      experienciaanastesia: experienciaanastesia !== undefined ? parseBooleanSafe(experienciaanastesia) : (anestesiaLocal !== undefined ? parseBooleanSafe(anestesiaLocal) : perfil.experienciaanastesia),
      condicoesdentarias: (detalhesPreExistentes || condicoesdentarias) !== undefined ? (detalhesPreExistentes || condicoesdentarias) : perfil.condicoesdentarias,
      habitoigieneoral: (habitosHigieneOral || habitoigieneoral) !== undefined ? (habitosHigieneOral || habitoigieneoral) : perfil.habitoigieneoral,
      consumosubstancia: (detalhesSubstancias || consumosubstancia) !== undefined ? (detalhesSubstancias || consumosubstancia) : perfil.consumosubstancia,
      historicotratamentosdentariospassados: (historicoTratamentos || historicotratamentosdentariospassados) !== undefined ? (historicoTratamentos || historicotratamentosdentariospassados) : perfil.historicotratamentosdentariospassados,
      historicodor: historicodor !== undefined ? parseBooleanSafe(historicodor) : (dorSensibilidade !== undefined ? parseBooleanSafe(dorSensibilidade) : perfil.historicodor),
      atividadesdesportivas: (atividadesDesportivas || atividadesdesportivas) !== undefined ? (atividadesDesportivas || atividadesdesportivas) : perfil.atividadesdesportivas,
      bruxismo: (tipoBruxismo || bruxismo) !== undefined ? (tipoBruxismo || bruxismo) : perfil.bruxismo,
      gravida: gravida !== undefined ? parseBooleanSafe(gravida) : (gravidez !== undefined ? parseBooleanSafe(gravidez) : perfil.gravida),
      infoadicional: (infoAdicional || infoadicional) !== undefined ? (infoAdicional || infoadicional) : perfil.infoadicional,
      resultadosanteriores: (resultadosAnteriores || resultadosanteriores) !== undefined ? (resultadosAnteriores || resultadosanteriores) : perfil.resultadosanteriores,
      posidutilizador: idResponsavel !== undefined ? parseIntegerOrNull(idResponsavel) : perfil.posidutilizador
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

// Eliminar perfil de utilizador com limpeza em cascata
controllers.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const perfil = await Utilizadorperfil.findByPk(id);

    if (!perfil) {
      return res.status(404).json({ success: false, message: "Perfil não encontrado." });
    }

    const perfilId = Number(id);

    try {
      if (Consultas) await Consultas.destroy({ where: { idutilizadorprefil: perfilId } });
    } catch (e) { console.log("Aviso eliminar consultas:", e.message); }

    try {
      if (Conta) await Conta.destroy({ where: { idprefil: perfilId } });
    } catch (e) { console.log("Aviso eliminar contas:", e.message); }

    try {
      if (Notificacao) await Notificacao.destroy({ where: { prefil: perfilId } });
    } catch (e) { console.log("Aviso eliminar notificacoes:", e.message); }

    try {
      if (Comprovativo) await Comprovativo.destroy({ where: { idutilizadorprefil: perfilId } });
    } catch (e) { console.log("Aviso eliminar comprovativos:", e.message); }

    try {
      await Utilizadorperfil.update({ posidutilizador: null }, { where: { posidutilizador: perfilId } });
    } catch (e) { console.log("Aviso desassociar dependentes:", e.message); }

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

module.exports = controllers;
const Conta = require("../model/Conta");
const TipoConta = require("../model/tipoconta");
const Utilizadorperfil = require("../model/Utilizadorperfil");
const bcrypt = require("bcryptjs");

const controllers = {};

controllers.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log("📥 Tentativa de login recebida:", { username });

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Nome de utilizador e palavra-passe são obrigatórios."
      });
    }

    const conta = await Conta.findOne({
      where: { nome: username },
      include: [
        { model: TipoConta, as: 'TipoContaData' },
        { model: Utilizadorperfil, as: 'UtilizadorperfilData' }
      ]
    });

    if (!conta) {
      return res.status(401).json({
        success: false,
        message: "Utilizador não encontrado."
      });
    }

    let isMatch = false;
    if (conta.password && (conta.password.startsWith("$2a$") || conta.password.startsWith("$2b$"))) {
      isMatch = bcrypt.compareSync(password, conta.password);
    } else {
      isMatch = conta.password === password;
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Palavra-passe incorreta."
      });
    }

    const perfilData = conta.UtilizadorperfilData ? {
      id: conta.UtilizadorperfilData.idutilizadorprefil,
      nome: conta.UtilizadorperfilData.nome,
      email: conta.UtilizadorperfilData.gmail,
      contactoprincipal: conta.UtilizadorperfilData.contactoprincipal,
      nif: conta.UtilizadorperfilData.nif
    } : null;

    res.json({
      success: true,
      message: "Login realizado com sucesso!",
      data: {
        id: conta.idconta,
        username: conta.nome,
        nome: conta.UtilizadorperfilData ? conta.UtilizadorperfilData.nome : conta.nome,
        email: conta.UtilizadorperfilData ? conta.UtilizadorperfilData.gmail : `${conta.nome.toLowerCase().replace(/\s/g, '.')}@clinica.com`,
        idtipoconta: Number(conta.idtipoconta),
        tipoConta: conta.TipoContaData ? conta.TipoContaData.desling : "Desconhecido",
        idprefil: conta.idprefil,
        perfil: perfilData
      }
    });

  } catch (error) {
    console.error("❌ Erro no login:", error);
    res.status(500).json({
      success: false,
      message: "Erro no servidor: " + error.message
    });
  }
};

controllers.criar = async (req, res) => {
  try {
    const { nome, password, tipoconta, idprefil } = req.body;

    console.log("📥 Pedido para criar conta:", { nome, tipoconta, idprefil });

    if (!nome || !password) {
      return res.status(400).json({
        success: false,
        message: "Nome de utilizador e Palavra-passe são obrigatórios!"
      });
    }

    // Verificar se a conta já existe
    const contaExistente = await Conta.findOne({ where: { nome: nome } });
    if (contaExistente) {
      return res.status(400).json({
        success: false,
        message: "Já existe uma conta com este nome de utilizador."
      });
    }

    // Se um perfil foi fornecido, verificar se existe
    let perfil = null;
    if (idprefil) {
      perfil = await Utilizadorperfil.findByPk(Number(idprefil));
      if (!perfil) {
        return res.status(404).json({
          success: false,
          message: "O perfil selecionado não existe na base de dados."
        });
      }
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const novaConta = await Conta.create({
      nome: nome,
      password: hashedPassword,
      idtipoconta: tipoconta ? Number(tipoconta) : 3, // Default para Paciente
      idprefil: idprefil ? Number(idprefil) : null
    });

    const contaComDetalhes = await Conta.findByPk(novaConta.idconta, {
      include: [
        { model: TipoConta, as: 'TipoContaData' },
        { model: Utilizadorperfil, as: 'UtilizadorperfilData' }
      ]
    });

    res.json({
      success: true,
      message: "Conta criada e associada ao perfil com sucesso!",
      data: {
        id: contaComDetalhes.idconta,
        username: contaComDetalhes.nome,
        idtipoconta: contaComDetalhes.idtipoconta,
        idprefil: contaComDetalhes.idprefil,
        tipoConta: contaComDetalhes.TipoContaData ? contaComDetalhes.TipoContaData.desling : null,
        perfil: contaComDetalhes.UtilizadorperfilData ? {
          id: contaComDetalhes.UtilizadorperfilData.idutilizadorprefil,
          nome: contaComDetalhes.UtilizadorperfilData.nome
        } : null
      }
    });

  } catch (error) {
    console.error("❌ Erro ao criar conta:", error);
    res.status(500).json({
      success: false,
      message: "Erro no servidor ao criar conta: " + error.message
    });
  }
};

controllers.list = async (req, res) => {
  try {
    const contas = await Conta.findAll({
      include: [
        { model: TipoConta, as: 'TipoContaData' },
        { model: Utilizadorperfil, as: 'UtilizadorperfilData' }
      ]
    });
    res.json({ success: true, data: contas });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = controllers;

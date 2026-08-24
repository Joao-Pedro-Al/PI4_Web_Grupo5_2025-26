const Comprovativo = require("../model/Comprovativo");
const Consultas = require("../model/Consultas");
const Utilizadorperfil = require("../model/Utilizadorperfil");

const controllers = {};

// Listar todos os comprovativos
controllers.list = async (req, res) => {
  try {
    const data = await Comprovativo.findAll({
      include: [
        { model: Consultas, as: "ConsultaData" },
        { model: Utilizadorperfil, as: "UtilizadorData" },
      ],
      order: [["data_emissao", "DESC"]],
    });
    res.json({ success: true, data: data });
  } catch (error) {
    console.error("Erro ao listar comprovativos:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Listar comprovativos de um paciente específico (para o cliente retirar)
controllers.listPaciente = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Comprovativo.findAll({
      where: { idutilizadorprefil: id },
      include: [
        { model: Consultas, as: "ConsultaData" },
      ],
      order: [["data_emissao", "DESC"]],
    });
    res.json({ success: true, data: data });
  } catch (error) {
    console.error("Erro ao obter comprovativos do paciente:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Emitir / Criar novo comprovativo
controllers.create = async (req, res) => {
  try {
    const { idconsulta, idutilizadorprefil, tipo_documento, titulo, ficheiro_path, valor } = req.body;

    if (!idutilizadorprefil || !tipo_documento || !titulo) {
      return res.status(400).json({
        success: false,
        message: "Campos idutilizadorprefil, tipo_documento e titulo sao obrigatorios.",
      });
    }

    const novodoc = await Comprovativo.create({
      idconsulta: idconsulta || null,
      idutilizadorprefil: Number(idutilizadorprefil),
      tipo_documento: tipo_documento,
      titulo: titulo,
      ficheiro_path: ficheiro_path || null,
      valor: valor ? parseFloat(valor) : 0.0,
      data_emissao: new Date(),
    });

    res.json({ success: true, message: "Comprovativo gerado com sucesso!", data: novodoc });
  } catch (error) {
    console.error("Erro ao criar comprovativo:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = controllers;

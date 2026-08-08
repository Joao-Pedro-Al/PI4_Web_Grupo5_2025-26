var Utilizadorperfil = require("../model/Utilizadorperfil");
var TipoMarcacao = require("../model/tipomarcacao");
var Consultas = require("../model/Consultas");
var sequelize = require("../model/database");

const controllers = {};

// Listar todas as consultas (Médico / Backoffice)
controllers.list = async (req, res) => {
  try {
    const data = await Consultas.findAll({
      include: [
        { model: TipoMarcacao, as: 'TipoMarcacaoData' },
        { model: Utilizadorperfil, as: 'UtilizadorData' }
      ],
      order: [['data', 'ASC'], ['hora', 'ASC']]
    });
    res.json({ success: true, data: data });
  } catch (error) {
    console.error("Erro durante a listagem de consultas:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Listar consultas por paciente (Paciente / Frontoffice)
controllers.listPaciente = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Consultas.findAll({
      where: { idutilizadorprefil: Number(id) },
      include: [
        { model: TipoMarcacao, as: 'TipoMarcacaoData' },
        { model: Utilizadorperfil, as: 'UtilizadorData' }
      ],
      order: [['data', 'ASC'], ['hora', 'ASC']]
    });
    res.json({ success: true, data: data });
  } catch (error) {
    console.error("Erro durante a listagem por paciente:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Listar tipos de marcação disponíveis
controllers.listTiposMarca = async (req, res) => {
  try {
    const data = await TipoMarcacao.findAll();
    res.json({ success: true, data: data });
  } catch (error) {
    console.error("Erro durante a listagem de tipos de marcação:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Criar nova consulta (Gravar na BD)
controllers.create = async (req, res) => {
  try {
    const {
      medico,
      idutilizadorprefil,
      tipomarcacao,
      data,
      hora,
      horaFim,
      numerotelemovel,
      detalhes,
      guia_tratamento
    } = req.body;

    console.log("Pedido para criar consulta:", req.body);

    if (!idutilizadorprefil || !data || !hora || !tipomarcacao) {
      return res.status(400).json({
        success: false,
        message: "Paciente, data, hora e tipo de consulta são obrigatórios."
      });
    }

    const novaConsulta = await Consultas.create({
      medico: medico || "Médico Dentista",
      idutilizadorprefil: Number(idutilizadorprefil),
      tipomarcacao: Number(tipomarcacao),
      data: new Date(data.includes('T') ? data : `${data}T12:00:00Z`),
      hora: hora,
      horaFim: horaFim || null,
      numerotelemovel: numerotelemovel ? String(numerotelemovel) : null,
      detalhes: detalhes || null,
      guia_tratamento: guia_tratamento || null,
      falta: false,
      estadimarcacao: true
    });

    // Recarregar a consulta criada com as associações
    const consultaComDetalhes = await Consultas.findByPk(novaConsulta.idconsulta, {
      include: [
        { model: TipoMarcacao, as: 'TipoMarcacaoData' },
        { model: Utilizadorperfil, as: 'UtilizadorData' }
      ]
    });

    console.log("✅ Consulta criada com sucesso ID:", novaConsulta.idconsulta);

    res.json({
      success: true,
      message: "Consulta agendada com sucesso!",
      data: consultaComDetalhes
    });
  } catch (error) {
    console.error("❌ Erro ao criar consulta:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atualizar consulta
controllers.update = async (req, res) => {
  try {
    const { id } = req.params;
    const consulta = await Consultas.findByPk(id);

    if (!consulta) {
      return res.status(404).json({ success: false, message: "Consulta não encontrada." });
    }

    const updateData = { ...req.body };

    // Converter data para objeto Date se for string
    if (updateData.data) {
      if (typeof updateData.data === 'string') {
        const dateStr = updateData.data.split('T')[0];
        updateData.data = new Date(`${dateStr}T12:00:00Z`);
      } else if (!(updateData.data instanceof Date)) {
        updateData.data = new Date(updateData.data);
      }
    }

    await consulta.update(updateData);

    const consultaAtualizada = await Consultas.findByPk(id, {
      include: [
        { model: TipoMarcacao, as: 'TipoMarcacaoData' },
        { model: Utilizadorperfil, as: 'UtilizadorData' }
      ]
    });

    console.log("Consulta actualizada ID:", id, "nova data:", updateData.data, "hora:", updateData.hora);

    res.json({
      success: true,
      message: "Consulta atualizada com sucesso!",
      data: consultaAtualizada
    });
  } catch (error) {
    console.error("Erro ao atualizar consulta:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Eliminar / Cancelar consulta
controllers.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const consulta = await Consultas.findByPk(id);

    if (!consulta) {
      return res.status(404).json({ success: false, message: "Consulta não encontrada." });
    }

    await consulta.destroy();

    res.json({
      success: true,
      message: "Consulta cancelada com sucesso!"
    });
  } catch (error) {
    console.error("Erro ao eliminar consulta:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = controllers;

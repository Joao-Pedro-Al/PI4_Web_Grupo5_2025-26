var Utilizadorperfil = require("../model/Utilizadorperfil");
var TipoMarcacao = require("../model/tipomarcacao");
var Consultas = require("../model/Consultas");
var Notificacao = require("../model/Notificacao");
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

// Obter consulta por ID
controllers.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Consultas.findByPk(id, {
      include: [
        { model: TipoMarcacao, as: 'TipoMarcacaoData' },
        { model: Utilizadorperfil, as: 'UtilizadorData' }
      ]
    });
    if (!data) {
      return res.status(404).json({ success: false, message: "Consulta não encontrada." });
    }
    res.json({ success: true, data: data });
  } catch (error) {
    console.error("Erro ao obter consulta por ID:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Criar nova consulta (Gravar na BD e Enviar Notificação a Médico e Paciente)
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
      guia_tratamento,
      urgencia
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
      urgencia: urgencia || "Normal",
      falta: false,
      estadimarcacao: true
    });

    const consultaComDetalhes = await Consultas.findByPk(novaConsulta.idconsulta, {
      include: [
        { model: TipoMarcacao, as: 'TipoMarcacaoData' },
        { model: Utilizadorperfil, as: 'UtilizadorData' }
      ]
    });

    // ================= NOTIFICAÇÕES AUTOMÁTICAS (LÓGICA TRIGGER) =================
    const pacienteNome = consultaComDetalhes.UtilizadorData?.nome || "Paciente";
    const dateStr = typeof data === 'string' ? data.split('T')[0] : new Date(data).toISOString().split('T')[0];
    const [ano, mes, dia] = dateStr.split('-');
    const dateFormatted = `${dia}-${mes}-${ano}`;

    // 1. Notificação para o Paciente
    await Notificacao.create({
      prefil: Number(idutilizadorprefil),
      titulo: "Consulta Agendada",
      descricao: `A sua consulta no dia ${dateFormatted} às ${hora} foi agendada.`,
      visto: false
    });

    // 2. Notificação para o Médico
    const doctorPerfil = await Utilizadorperfil.findOne({ where: { nome: medico } });
    if (doctorPerfil) {
      await Notificacao.create({
        prefil: doctorPerfil.idutilizadorprefil,
        titulo: "Nova Consulta na Agenda",
        descricao: `Nova consulta agendada para o paciente ${pacienteNome} no dia ${dateFormatted} às ${hora}.`,
        visto: false
      });
    }

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

    const oldData = consulta.data;
    const oldHora = consulta.hora;
    const oldFalta = consulta.falta;

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

    // ================= NOTIFICAÇÕES AUTOMÁTICAS (LÓGICA TRIGGER) =================
    const formatDDMMYYYY = (d) => {
      if (!d) return '';
      const iso = d instanceof Date ? d.toISOString().split('T')[0] : String(d).split('T')[0];
      const [a, m, dia] = iso.split('-');
      return `${dia}-${m}-${a}`;
    };

    const oldDateStr = formatDDMMYYYY(oldData);
    const newDateStr = formatDDMMYYYY(consultaAtualizada.data);
    const newHoraStr = consultaAtualizada.hora;

    const dataOuHoraAlterada = (oldDateStr !== newDateStr) || (oldHora !== newHoraStr);
    const faltaMarcada = (!oldFalta && consultaAtualizada.falta === true);

    if (dataOuHoraAlterada) {
      await Notificacao.create({
        prefil: consulta.idutilizadorprefil,
        titulo: "Consulta remarcada!",
        descricao: `A sua consulta no dia ${oldDateStr} foi remarcada para ${newDateStr} às ${newHoraStr}.`,
        visto: false
      });
    } else if (faltaMarcada) {
      await Notificacao.create({
        prefil: consulta.idutilizadorprefil,
        titulo: "Remarcar Consulta",
        descricao: `Por favor nos contacte para podermos remarcar a consulta que estava prevista para o dia ${oldDateStr}.`,
        visto: false
      });
    }

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

    const oldData = consulta.data;
    const formatDDMMYYYY = (d) => {
      if (!d) return '';
      const iso = d instanceof Date ? d.toISOString().split('T')[0] : String(d).split('T')[0];
      const [a, m, dia] = iso.split('-');
      return `${dia}-${m}-${a}`;
    };

    const oldDateStr = formatDDMMYYYY(oldData);

    // Verificar se a consulta é futura ou de hoje
    const todayStr = new Date().toISOString().split('T')[0];
    const oldIsoStr = oldData ? (oldData instanceof Date ? oldData.toISOString().split('T')[0] : String(oldData).split('T')[0]) : '';

    await consulta.destroy();

    // ================= NOTIFICAÇÕES AUTOMÁTICAS (LÓGICA TRIGGER) =================
    if (oldIsoStr && oldIsoStr >= todayStr) {
      await Notificacao.create({
        prefil: consulta.idutilizadorprefil,
        titulo: "Consulta desmarcada!",
        descricao: `A sua consulta no dia ${oldDateStr} foi desmarcada.`,
        visto: false
      });
    }

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

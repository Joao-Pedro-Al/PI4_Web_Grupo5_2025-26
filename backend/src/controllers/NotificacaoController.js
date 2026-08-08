// controllers/NotificacaoController.js
const { Op } = require("sequelize");
const Notificacao = require("../model/Notificacao");
const Utilizadorperfil = require("../model/Utilizadorperfil");
const sequelize = require("../model/database");
const controllers = {};

// Listar todas as notificações (Médico / Backoffice)
controllers.list = async (req, res) => {
  try {
    const data = await Notificacao.findAll({
      include: [
        {
          model: Utilizadorperfil,
          as: "PerfilData",
          attributes: ["idutilizadorprefil", "nome", "gmail"]
        }
      ],
      order: [['idnotificacao', 'DESC']]
    });
    res.json({ success: true, data: data });
  } catch (error) {
    console.error("Erro ao listar notificações:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Listar notificações por perfil (Paciente / Frontoffice - inclui notificações do perfil e notificações gerais/globais)
controllers.listByPerfil = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const data = await Notificacao.findAll({
      where: {
        [Op.or]: [
          { prefil: id },
          { prefil: null }
        ]
      },
      include: [
        {
          model: Utilizadorperfil,
          as: "PerfilData",
          attributes: ["idutilizadorprefil", "nome", "gmail"]
        }
      ],
      order: [['idnotificacao', 'DESC']]
    });
    res.json({ success: true, data: data });
  } catch (error) {
    console.error("Erro ao listar notificações do perfil:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Listar notificações não vistas por perfil
controllers.listNaoVistasByPerfil = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const data = await Notificacao.findAll({
      where: { 
        [Op.or]: [
          { prefil: id },
          { prefil: null }
        ],
        visto: false 
      },
      order: [['idnotificacao', 'DESC']]
    });
    res.json({ success: true, data: data });
  } catch (error) {
    console.error("Erro ao listar notificações não vistas:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Criar nova notificação (Apenas médicos / administradores)
controllers.create = async (req, res) => {
  try {
    const { prefil, titulo, descricao, visto = false } = req.body;

    console.log("📥 Criar notificação:", { prefil, titulo, descricao });

    if (!titulo) {
      return res.status(400).json({
        success: false,
        error: "O campo 'titulo' é obrigatório"
      });
    }

    const novaNotificacao = await Notificacao.create({
      prefil: (prefil && prefil !== "null" && prefil !== "") ? Number(prefil) : null,
      titulo,
      descricao: descricao || null,
      visto: Boolean(visto)
    });

    console.log("✅ Notificação criada com ID:", novaNotificacao.idnotificacao);

    res.json({
      success: true,
      message: "Notificação criada com sucesso!",
      data: novaNotificacao
    });
  } catch (error) {
    console.error("❌ Erro ao criar notificação:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Marcar notificação como vista (ou alterar estado de visto)
controllers.marcarComoVista = async (req, res) => {
  try {
    const { id } = req.params;
    const { visto } = req.body || {};
    
    const notificacao = await Notificacao.findByPk(id);
    if (!notificacao) {
      return res.status(404).json({ success: false, error: "Notificação não encontrada" });
    }
    
    if (typeof visto === "boolean") {
      notificacao.visto = visto;
    } else {
      notificacao.visto = !notificacao.visto;
    }
    await notificacao.save();
    
    res.json({ 
      success: true, 
      message: "Notificação atualizada com sucesso!",
      data: notificacao 
    });
  } catch (error) {
    console.error("Erro ao marcar notificação como vista:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Marcar todas como vistas de um perfil
controllers.marcarTodasComoVistas = async (req, res) => {
  try {
    const id = Number(req.params.id);
    
    await Notificacao.update(
      { visto: true },
      {
        where: {
          [Op.or]: [
            { prefil: id },
            { prefil: null }
          ]
        }
      }
    );
    
    res.json({ 
      success: true, 
      message: "Todas as notificações foram marcadas como vistas!" 
    });
  } catch (error) {
    console.error("Erro ao marcar todas como vistas:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Deletar notificação
controllers.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notificacao = await Notificacao.findByPk(id);
    if (!notificacao) {
      return res.status(404).json({ success: false, error: "Notificação não encontrada" });
    }
    
    await notificacao.destroy();
    
    res.json({ 
      success: true, 
      message: "Notificação deletada com sucesso!" 
    });
  } catch (error) {
    console.error("Erro ao deletar notificação:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Deletar todas as notificações de um perfil
controllers.deleteAllByPerfil = async (req, res) => {
  try {
    const id = Number(req.params.id);
    
    await Notificacao.destroy({
      where: {
        [Op.or]: [
          { prefil: id },
          { prefil: null }
        ]
      }
    });
    
    res.json({ 
      success: true, 
      message: "Todas as notificações foram removidas!" 
    });
  } catch (error) {
    console.error("Erro ao deletar todas as notificações:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = controllers;
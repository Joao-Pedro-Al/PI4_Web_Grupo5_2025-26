// controllers/NotificacaoController.js
const Notificacao = require("../model/Notificacao");
const sequelize = require("../model/database");
const controllers = {};

// Listar todas as notificações
// CORREÇÃO NAS FUNÇÕES DE LISTAGEM

// Listar todas as notificações
controllers.list = async (req, res) => {
  try {
    const data = await Notificacao.findAll({
      order: [['idnotificacao', 'DESC']] // Alterado de data_criacao para idnotificacao
    });
    res.json({ success: true, data: data });
  } catch (error) {
    console.error("Erro ao listar notificações:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Listar notificações por perfil
controllers.listByPerfil = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Notificacao.findAll({
      where: { prefil: id },
      order: [['idnotificacao', 'DESC']] // Alterado de data_criacao para idnotificacao
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
    const { id } = req.params;
    const data = await Notificacao.findAll({
      where: { 
        prefil: id,
        visto: false 
      },
      order: [['idnotificacao', 'DESC']] // Alterado de data_criacao para idnotificacao
    });
    res.json({ success: true, data: data });
  } catch (error) {
    console.error("Erro ao listar notificações não vistas:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
// Criar nova notificação
controllers.create = async (req, res) => {
  try {
    console.log("📥 ========== NOVA REQUISIÇÃO ==========");
    console.log("📥 Método:", req.method);
    console.log("📥 URL:", req.originalUrl);
    console.log("📥 Headers:", JSON.stringify(req.headers, null, 2));
    console.log("📥 Body recebido:", req.body);
    console.log("📥 Tipo do body:", typeof req.body);
    
    const { prefil, titulo, descricao, visto = false } = req.body;
    
    console.log("📋 Campos extraídos:");
    console.log("- prefil:", prefil, "(tipo:", typeof prefil, ")");
    console.log("- titulo:", titulo, "(tipo:", typeof titulo, ")");
    console.log("- descricao:", descricao, "(tipo:", typeof descricao, ")");
    console.log("- visto:", visto, "(tipo:", typeof visto, ")");
    
    // Validação manual do título
    if (!titulo) {
      console.log("❌ Título está vazio ou undefined!");
      return res.status(400).json({ 
        success: false, 
        error: "O campo 'titulo' é obrigatório" 
      });
    }
    
    console.log("✅ Todos os campos validados, criando notificação...");
    
    // CORREÇÃO: Removido data_criacao, deixe o modelo usar o valor padrão
    const novaNotificacao = await Notificacao.create({
      prefil: prefil || null,
      titulo,
      descricao,
      visto
      // REMOVIDO: data_criacao: new Date()
    });
    
    console.log("✅ Notificação criada com ID:", novaNotificacao.idnotificacao);
    
    res.json({ 
      success: true, 
      message: "Notificação criada com sucesso!",
      data: novaNotificacao 
    });
  } catch (error) {
    console.error("❌ Erro ao criar notificação:");
    console.error("❌ Mensagem:", error.message);
    console.error("❌ Stack:", error.stack);
    console.error("❌ Nome:", error.name);
    console.error("❌ Erros completos:", JSON.stringify(error, null, 2));
    
    res.status(500).json({ success: false, error: error.message });
  }
};

// Marcar notificação como vista
controllers.marcarComoVista = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notificacao = await Notificacao.findByPk(id);
    if (!notificacao) {
      return res.status(404).json({ success: false, error: "Notificação não encontrada" });
    }
    
    notificacao.visto = true;
    await notificacao.save();
    
    res.json({ 
      success: true, 
      message: "Notificação marcada como vista!",
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
    const { id } = req.params;
    
    await Notificacao.update(
      { visto: true },
      { where: { prefil: id } }
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
    const { id } = req.params;
    
    await Notificacao.destroy({
      where: { prefil: id }
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
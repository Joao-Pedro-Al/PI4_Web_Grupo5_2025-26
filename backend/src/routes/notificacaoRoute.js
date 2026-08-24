// routes/notificacaoRoute.js
const express = require("express");
const router = express.Router();
const notificacaoController = require("../controllers/NotificacaoController");

// Rotas para notificações
router.get("/list", notificacaoController.list);
router.get("/list/:id", notificacaoController.listByPerfil);
router.get("/nao-vistas/:id", notificacaoController.listNaoVistasByPerfil);
router.post("/create", notificacaoController.create);
router.put("/vista/:id", notificacaoController.marcarComoVista);
router.put("/vista-todas/:id", notificacaoController.marcarTodasComoVistas);
router.delete("/delete/:id", notificacaoController.delete);
router.delete("/delete-all/:id", notificacaoController.deleteAllByPerfil);

module.exports = router;
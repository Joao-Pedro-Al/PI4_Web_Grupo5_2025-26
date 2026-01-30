const express = require("express");
const router = express.Router();
//importer os controladores [2]
const consultasController = require("../controllers/ConsultasController");
router.get("/list", consultasController.list);
router.get("/list/:id", consultasController.listPaciente);
module.exports = router;
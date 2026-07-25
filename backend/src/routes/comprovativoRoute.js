const express = require("express");
const router = express.Router();
const comprovativoController = require("../controllers/comprovativoController");

router.get("/list", comprovativoController.list);
router.get("/paciente/:id", comprovativoController.listPaciente);
router.post("/create", comprovativoController.create);

module.exports = router;

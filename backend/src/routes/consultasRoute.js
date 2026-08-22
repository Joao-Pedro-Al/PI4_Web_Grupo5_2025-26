const express = require("express");
const router = express.Router();
const consultasController = require("../controllers/ConsultasController");

router.get("/list", consultasController.list);
router.get("/get/:id", consultasController.getById);
router.get("/list/:id", consultasController.listPaciente);
router.get("/tipomarcacao/list", consultasController.listTiposMarca);
router.post("/create", consultasController.create);
router.put("/update/:id", consultasController.update);
router.delete("/delete/:id", consultasController.delete);

module.exports = router;
const express = require("express");
const router = express.Router();
const contaController = require("../controllers/contaController");

router.post("/login", contaController.login);
router.post("/criar", contaController.criar);
router.get("/list", contaController.list);

module.exports = router;

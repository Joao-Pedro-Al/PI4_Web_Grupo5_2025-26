const express = require("express");
const router = express.Router();
//importer os controladores [2]
const utilizadorperfilController = require("../controllers/utilizadorperfilController");
//router.get("/test", utilizadorperfilController.test);
/*router.post("/criar", async (req, res) => {
  try {
    const perfil = await Utilizadorperfil.create(req.body);
    res.status(201).json(perfil);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao criar perfil" });
  }
});*/
router.post('/create',utilizadorperfilController.create);
router.get("/save", (req, res) => {
  res.json({ status: "perfil salvo" });
});
// router.get("/testdata", utilizadorperfilController.testdata);
router.get("/list", utilizadorperfilController.list);
router.get("/list/:id", utilizadorperfilController.listPerfilInteiro);
module.exports = router;
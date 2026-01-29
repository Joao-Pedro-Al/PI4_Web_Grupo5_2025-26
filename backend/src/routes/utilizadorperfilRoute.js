const express = require("express");
const router = express.Router();
//importer os controladores [2]
const utilizadorperfilController = require("../controllers/utilizadorperfilController");
//router.get("/test", utilizadorperfilController.test);
router.get("/save", (req, res) => {
  res.json({ status: "perfil salvo" });
});
// router.get("/testdata", utilizadorperfilController.testdata);
router.get("/list", utilizadorperfilController.list);
module.exports = router;
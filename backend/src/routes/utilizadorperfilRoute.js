const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

//importer os controladores [2]
const utilizadorperfilController = require("../controllers/utilizadorperfilController");

// Configuração do multer: guarda os ficheiros na pasta /uploads,
// com um nome único (timestamp + nome original) para evitar colisões.
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage: storage });

//router.get("/test", utilizadorperfilController.test);
router.get("/save", (req, res) => {
  res.json({ status: "perfil salvo" });
});
// router.get("/testdata", utilizadorperfilController.testdata);
router.get("/list", utilizadorperfilController.list);
router.get("/list/:id", utilizadorperfilController.listPerfilInteiro);

// 'ficheiros' tem de bater certo com o nome usado no FormData.append() do frontend
router.post('/create', upload.array('ficheiros', 10), utilizadorperfilController.create);

router.get("/conta/criar", utilizadorperfilController.criarconta);
module.exports = router;
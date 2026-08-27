const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// Importer os controladores
const utilizadorperfilController = require("../controllers/utilizadorperfilController");

// Configuração do multer: guarda os ficheiros na pasta /uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage: storage });

router.get("/save", (req, res) => {
  res.json({ status: "perfil salvo" });
});

router.get("/list", utilizadorperfilController.list);
router.get("/list/:id", utilizadorperfilController.listPerfilInteiro);
router.get("/dependentes/:id", utilizadorperfilController.listDependentes);

router.post('/create', upload.array('ficheiros', 10), utilizadorperfilController.create);

// Suporte para PUT e POST no update
router.put('/update/:id', upload.array('ficheiros', 10), utilizadorperfilController.update);
router.post('/update/:id', upload.array('ficheiros', 10), utilizadorperfilController.update);

// Suporte para DELETE e POST no delete
router.delete('/delete/:id', utilizadorperfilController.delete);
router.post('/delete/:id', utilizadorperfilController.delete);

router.get("/conta/criar", utilizadorperfilController.criarconta);

module.exports = router;
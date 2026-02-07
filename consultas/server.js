const express = require("express");
const mongoose = require("mongoose");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/hospital")
  .then(() => console.log("MongoDB ligado com sucesso"))
  .catch(err => console.log("Erro MongoDB:", err));

const ConsultaSchema = new mongoose.Schema({
  tipo_consulta: String,
  medico: String,
  descricao: String
});

const Consulta = mongoose.model("Consulta", ConsultaSchema);

app.post("/guardar-consulta", async (req, res) => {
  try {
    const consulta = new Consulta({
      tipo_consulta: req.body.tipo_consulta,
      medico: req.body.medico,
      descricao: req.body.descricao
    });

    await consulta.save();
    res.send("Consulta guardada com sucesso!");
  } catch (err) {
    console.log(err);
    res.status(500).send("Erro ao guardar consulta");
  }
});

app.listen(3000, () => {
  console.log("Servidor em http://localhost:3000");
});

// buscar todas as consultas
app.get("/consultas", async (req, res) => {
  try {
    const consultas = await Consulta.find().sort({ _id: -1 });
    res.json(consultas);
  } catch (err) {
    console.log(err);
    res.status(500).json({ erro: "Erro ao buscar consultas" });
  }
});
// buscar todas as consultas
app.get("/consultas", async (req, res) => {
  try {
    const consultas = await Consulta.find().sort({ _id: -1 });
    res.json(consultas);
  } catch (err) {
    console.log(err);
    res.status(500).json({ erro: "Erro ao buscar consultas" });
  }
});

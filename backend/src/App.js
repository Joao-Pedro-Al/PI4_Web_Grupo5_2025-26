const express = require("express");
var cors = require('cors');
const app = express();
const path = require("path");

// Serve os ficheiros anexados (exames, raios-x, etc.) e força o download
// no browser em vez de os abrir. A pasta 'uploads' está em backend/uploads,
// um nível acima deste ficheiro (backend/src/App.js) — por isso '../uploads'.
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res, filePath) => {
    res.setHeader('Content-Disposition', 'attachment; filename="' + path.basename(filePath) + '"');
  }
}));
app.use(cors());

// Configurações
app.set("port", process.env.PORT || 3000);

// Middlewares
app.use(express.json());

// Rotas
app.use("/teste", (req, res) => {
  res.send("Rota TESTE.");
});

const bcrypt = require("bcryptjs");

// Importação de rotas
const utilizadorperfilRouters = require("./routes/utilizadorperfilRoute.js");
const consultasRouters = require("./routes/consultasRoute.js");
const notificacaoRouters = require("./routes/notificacaoRoute.js");
const comprovativoRouters = require("./routes/comprovativoRoute.js");
const contaRouters = require("./routes/contaRoute.js");

// Usar as rotas
app.use("/utilizadorperfil", utilizadorperfilRouters);
app.use("/consultas", consultasRouters);
app.use("/notificacao", notificacaoRouters);
app.use("/comprovativo", comprovativoRouters);
app.use("/conta", contaRouters);
app.use("/api/conta", contaRouters);

// ========== ENDPOINT DE LOGIN E GESTÃO DE CONTAS ==========
const contaController = require("./controllers/contaController");
app.post("/api/login", contaController.login);
app.post("/api/conta/criar", contaController.criar);
app.post("/conta/criar", contaController.criar);

// Endpoint para verificar status
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    timestamp: new Date().toISOString(),
    port: app.get("port")
  });
});

// ========== FIM DOS ENDPOINTS DE LOGIN ==========

// Rota raiz
app.use("/", (req, res) => {
  res.send("Hello World - Backend PI4");
});

// Iniciar servidor
const initSeed = require("./init_seed");
const sequelizeDB = require("./model/database");

app.listen(app.get("port"), async () => {
  console.log("✅ Start server on port " + app.get("port"));
  console.log("📡 URL: http://localhost:" + app.get("port"));
  console.log("🔐 Login endpoint: POST /api/login");

  try {
    await sequelizeDB.authenticate();
    console.log("✅ Ligação à base de dados estabelecida!");
    await sequelizeDB.sync(); // Cria/atualiza tabelas
    await initSeed();         // Popula dados iniciais se vazio
  } catch (error) {
    console.error("❌ Erro ao inicializar base de dados:", error.message);
  }
});

module.exports = app;
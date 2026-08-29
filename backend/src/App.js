const express = require("express");
var cors = require('cors');
const app = express();
const path = require("path");

const fs = require("fs");

// Serve os ficheiros anexados (exames, raios-x, etc.)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rota explícita para download/visualização de ficheiro com fallback elegante
app.get('/uploads/:filename', (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(__dirname, '../uploads', filename);

  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  } else {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html>
        <head><title>Ficheiro Não Encontrado — CliniMolelos</title></head>
        <body style="font-family: 'Segoe UI', Tahoma, sans-serif; text-align: center; padding: 60px 20px; background-color: #FAF8F5; color: #2B2519;">
          <h1 style="color: #A99C5E; font-size: 26px; margin-bottom: 5px;">CLINIMOLELOS</h1>
          <p style="color: #666; font-size: 13px; text-transform: uppercase; margin-bottom: 30px;">Clínica de Medicina Dentária</p>
          <div style="background: white; border: 1.5px solid #E5DFD5; border-radius: 12px; max-width: 500px; margin: 0 auto; padding: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
            <h3 style="color: #c0392b; margin-top: 0;">Ficheiro Não Encontrado no Servidor</h3>
            <p style="color: #555; font-size: 14px; line-height: 1.6;">O anexo clínico <code>${filename}</code> já não se encontra armazenado no disco temporário do servidor.</p>
            <p style="font-size: 13px; color: #888;">Nota: Na versão gratuita de demonstração, o disco do servidor reinicia quando o serviço fica inativo.</p>
            <button onclick="window.close()" style="background: #A99C5E; color: white; border: none; padding: 10px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 15px;">Fechar Janela</button>
          </div>
        </body>
      </html>
    `);
  }
});
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

// Usar as rotas (com e sem prefixo /api)
app.use("/utilizadorperfil", utilizadorperfilRouters);
app.use("/api/utilizadorperfil", utilizadorperfilRouters);
app.use("/consultas", consultasRouters);
app.use("/api/consultas", consultasRouters);
app.use("/notificacao", notificacaoRouters);
app.use("/api/notificacao", notificacaoRouters);
app.use("/notificacoes", notificacaoRouters);
app.use("/api/notificacoes", notificacaoRouters);
app.use("/comprovativo", comprovativoRouters);
app.use("/api/comprovativo", comprovativoRouters);
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
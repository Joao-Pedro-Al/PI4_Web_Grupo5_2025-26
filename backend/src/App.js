const express = require("express");
var cors = require('cors');
const app = express();
app.use(cors());

// Configurações
app.set("port", process.env.PORT || 3000);

// Middlewares
app.use(express.json());

// Rotas
app.use("/teste", (req, res) => {
  res.send("Rota TESTE.");
});

// Importação de rotas
const utilizadorperfilRouters = require("./routes/utilizadorperfilRoute.js");
const consultasRouters = require("./routes/consultasRoute.js");
const notificacaoRouters = require("./routes/notificacaoRoute.js");

// Usar as rotas
app.use("/utilizadorperfil", utilizadorperfilRouters);
app.use("/consultas", consultasRouters);
app.use("/notificacao", notificacaoRouters);

// ========== ENDPOINT DE LOGIN ==========
const Conta = require("./model/Conta");

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log("📥 Tentativa de login:", { username, password });
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Usuário e senha são obrigatórios"
      });
    }

    // Busca a conta
    const conta = await Conta.findOne({
      where: { nome: username },
      include: [
        { model: require("./model/tipoconta"), as: 'TipoContaData' },
        { model: require("./model/Utilizadorperfil"), as: 'UtilizadorperfilData' }
      ]
    });

    if (!conta) {
      return res.status(401).json({
        success: false,
        message: "Usuário não encontrado"
      });
    }

    // Verifica senha (em texto simples no seu código)
    if (conta.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Senha incorreta"
      });
    }

    // Login bem sucedido
    res.json({
      success: true,
      message: "Login realizado com sucesso!",
      data: {
        id: conta.idconta,
        username: conta.nome,
        tipoConta: conta.TipoContaData ? conta.TipoContaData.desling : "Desconhecido",
        perfil: conta.UtilizadorperfilData ? {
          id: conta.UtilizadorperfilData.idutilizadorprefil,
          nome: conta.UtilizadorperfilData.nome
        } : null
      }
    });

  } catch (error) {
    console.error("❌ Erro no login:", error);
    res.status(500).json({
      success: false,
      message: "Erro no servidor: " + error.message
    });
  }
});

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
app.listen(app.get("port"), () => {
  console.log("✅ Start server on port " + app.get("port"));
  console.log("📡 URL: http://localhost:" + app.get("port"));
  console.log("🔐 Login endpoint: POST /api/login");
});

module.exports = app;
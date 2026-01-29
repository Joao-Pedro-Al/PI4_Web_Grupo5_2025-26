const express = require("express");
var cors = require('cors');
const app = express();
app.use(cors());
//Configurações
app.set("port", process.env.PORT || 3000);
//Middlewares
app.use(express.json());
//Rotas
app.use("/teste", (req, res) => {
  res.send("Rota TESTE.");
});
// importação de rotas [1]
const utilizadorperfilRouters = require("./routes/utilizadorperfilRoute.js");
//Rota
app.use("/utilizadorperfil", utilizadorperfilRouters);
app.listen(app.get("port"), () => {
  console.log("Start server on port " + app.get("port"));
});
app.get('/api/notificacao', async(req, res) => {
    try {
        const allNotificacao = await notificacaoPool.query(
            'SELECT * FROM items'
        );
        res.json({ allNotificacao });
    } catch (error) {
        console.log(error);
        res.status(500).send(error.message)
    }
})
app.post('/api/notificacao', async (req, res) => {
    const { description } = req.body;
    try {
        const newNotificacao = await notificacaoPool.query(
            'INSERT INTO notificacao (description) VALUES ($1) RETURNING *',
            [description]
        );
        res.json({ 
            message: "New notificacao added!",
            notificacao: newNotificacao.rows
         });
    } catch (error) {
        console.log(error);
        res.status(500).send(error.message)
    }
})
app.use("/", (req, res) => {
  res.send("Hello World");
});

module.exports = app;
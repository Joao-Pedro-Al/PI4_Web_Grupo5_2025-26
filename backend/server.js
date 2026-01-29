const express = require('express');
const app = express();
app.use(express.json());

const dotenv = require('dotenv');
dotenv.config();

const notificacaoPool = require('./dbConfig')

app.get('/', (req, res) => {
    res.send('Simple API homepage');
})

app.get('/api/notificacao', async(req, res) => {
    try {
        const allNotificacao = await notificacaoPool.query(
            'SELECT * FROM notificacao'
        );
        res.json({ allNotificacao,rows });
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
        res.status(201).json({ 
            message: "New item added!",
            notificacao: newNotificacao.rows
         });
    } catch (error) {
        console.log(error);
        res.status(500).send(error.message)
    }
})

app.listen(5070, () => {
    console.log("Server running on port 5070");
})

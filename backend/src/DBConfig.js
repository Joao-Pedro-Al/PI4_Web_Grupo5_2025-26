const { Pool } = require('pg');
const notificacaoPool = new Pool({
    connectionString: process.env.DBConfigLink,
    ssl: {
        rejectUnauthorized: false
    }
});
module.exports = notificacaoPool;

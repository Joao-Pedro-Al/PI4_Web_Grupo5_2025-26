postgresql:/grupo5:SlmPl5GlPIivIBJWNHBTFVC5ITrHTUty@dpg-d4vh1ju3jp1c73elefsg-a.frankfurt-postgres.render.com/pi4_g5
const { Pool } = require('pg');
const notificacaoPool = new Pool({
    connectionString: process.env.DBConfigLink,
    ssl: {
        rejectUnauthorized: false
    }
});
module.exports = notificacaoPool;

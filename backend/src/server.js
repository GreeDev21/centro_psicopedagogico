require('dotenv').config();
const { createApp } = require('./app');
const { pool } = require('./config/db');

const port = Number(process.env.PORT) || 4000;

async function start() {
  await pool.query('SELECT 1');
  const app = createApp();
  app.listen(port, () => {
    console.log(`API Centro Psicopedagógico en http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error('No se pudo iniciar el servidor:', error.message);
  process.exit(1);
});

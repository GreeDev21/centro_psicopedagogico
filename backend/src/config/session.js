const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const { dbConfig } = require('./db');

const store = new MySQLStore({
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  clearExpired: true,
  expiration: 1000 * 60 * 60 * 8,
  createDatabaseTable: true
});

function sessionMiddleware() {
  return session({
    name: 'centro.sid',
    secret: process.env.SESSION_SECRET || 'centro-psico-sesion',
    store,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 1000 * 60 * 60 * 8
    }
  });
}

module.exports = { sessionMiddleware };

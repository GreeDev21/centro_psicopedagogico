const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const { dbConfig } = require('./db');
const { sinAccesoBd } = require('../utils/dbError');

const mysqlStore = new MySQLStore({
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  clearExpired: true,
  expiration: 1000 * 60 * 60 * 8,
  createDatabaseTable: true
});

mysqlStore.on('error', (err) => {
  console.error('Sesión MySQL:', err.code || err.message);
});

class FallbackSessionStore extends session.Store {
  constructor() {
    super();
    this.memory = new session.MemoryStore();
    this.mysql = mysqlStore;
  }

  get(sid, cb) {
    this.memory.get(sid, (err, local) => {
      if (err) return cb(err);
      if (local) return cb(null, local);
      this.mysql.get(sid, (errMysql, sess) => {
        if (errMysql && sinAccesoBd(errMysql)) return cb(null, null);
        cb(errMysql, sess);
      });
    });
  }

  set(sid, sess, cb) {
    this.mysql.set(sid, sess, (err) => {
      if (!err) {
        this.memory.destroy(sid, () => cb && cb());
        return;
      }
      if (!sinAccesoBd(err)) return cb && cb(err);
      this.memory.set(sid, sess, cb);
    });
  }

  destroy(sid, cb) {
    this.memory.destroy(sid, () => {
      this.mysql.destroy(sid, (err) => {
        if (err && sinAccesoBd(err)) return cb && cb();
        cb && cb(err);
      });
    });
  }

  touch(sid, sess, cb) {
    this.memory.get(sid, (err, local) => {
      if (err) return cb && cb(err);
      if (local) return this.memory.touch(sid, sess, cb);
      this.mysql.touch(sid, sess, (errMysql) => {
        if (errMysql && sinAccesoBd(errMysql)) return cb && cb();
        cb && cb(errMysql);
      });
    });
  }
}

function sessionMiddleware() {
  return session({
    name: 'centro.sid',
    secret: process.env.SESSION_SECRET || 'centro-psico-sesion',
    store: new FallbackSessionStore(),
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

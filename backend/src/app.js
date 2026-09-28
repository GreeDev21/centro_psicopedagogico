const express = require('express');
const path = require('path');
const cors = require('cors');
const { sessionMiddleware } = require('./config/session');
const { errorHandler } = require('./middlewares/errorHandler');
const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const patientsRoutes = require('./routes/patients.routes');
const evaluationsRoutes = require('./routes/evaluations.routes');
const appointmentsRoutes = require('./routes/appointments.routes');
const statsRoutes = require('./routes/stats.routes');
const helpRoutes = require('./routes/help.routes');

function createApp() {
  const app = express();

  app.use(cors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
    credentials: true
  }));
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(sessionMiddleware());
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  app.get('/api/salud', (_req, res) => {
    res.json({ ok: true, servicio: 'Centro Psicopedagógico API' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/usuarios', usersRoutes);
  app.use('/api/pacientes', patientsRoutes);
  app.use('/api/evaluaciones', evaluationsRoutes);
  app.use('/api/turnos', appointmentsRoutes);
  app.use('/api/estadisticas', statsRoutes);
  app.use('/api/ayuda', helpRoutes);

  app.use(errorHandler);
  return app;
}

module.exports = { createApp };

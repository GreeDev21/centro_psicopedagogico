const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');
const logService = require('../services/logService');
const { publicUser } = require('../utils/http');
const { asyncHandler } = require('../utils/asyncHandler');
const { sinAccesoBd } = require('../utils/dbError');
const { adminDeRespaldo, claveCoincide } = require('../utils/adminEnv');

async function buscarUsuario(correo) {
  try {
    return { user: await userRepository.findByCorreo(correo) };
  } catch (err) {
    if (!sinAccesoBd(err)) throw err;
    return { sinBase: true };
  }
}

function ingresarAdminDeRespaldo(req, res, correo, contrasena) {
  const admin = adminDeRespaldo();
  if (!admin) {
    return res.status(503).json({ message: 'No hay acceso a la base de datos.' });
  }
  if (admin.correo !== correo || !claveCoincide(contrasena, admin.contrasena)) {
    return res.status(401).json({ message: 'Credenciales inválidas. La base de datos no está accesible.' });
  }
  req.session.user = publicUser(admin);
  return res.json({ user: req.session.user });
}

const login = asyncHandler(async (req, res) => {
  const correo = String(req.body.correo || '').trim().toLowerCase();
  const contrasena = String(req.body.contrasena || '');

  if (!correo || !contrasena) {
    return res.status(400).json({ message: 'Ingrese correo y contraseña.' });
  }

  const resultado = await buscarUsuario(correo);
  if (resultado.sinBase) {
    return ingresarAdminDeRespaldo(req, res, correo, contrasena);
  }

  const user = resultado.user;
  if (!user) {
    return res.status(401).json({ message: 'Credenciales inválidas.' });
  }

  const ok = await bcrypt.compare(contrasena, user.contrasena);
  if (!ok) {
    return res.status(401).json({ message: 'Credenciales inválidas.' });
  }

  req.session.user = publicUser(user);
  await logService.registrar(user.id_usuario, 'login', req, `${user.nombre} ${user.apellido} ingresó al sistema`);
  res.json({ user: req.session.user });
});

const logout = asyncHandler(async (req, res) => {
  const user = req.session.user;
  if (user?.id_usuario) {
    try {
      await logService.registrar(user.id_usuario, 'logout', req, `${user.nombre} ${user.apellido} cerró sesión`);
    } catch (err) {
      if (!sinAccesoBd(err)) throw err;
    }
  }
  req.session.destroy(() => {
    res.clearCookie('centro.sid');
    res.json({ ok: true });
  });
});

const me = asyncHandler(async (req, res) => {
  res.json({ user: req.session.user });
});

const changePassword = asyncHandler(async (req, res) => {
  if (!req.session.user.id_usuario) {
    return res.status(503).json({ message: 'Este administrador de respaldo no puede cambiar la contraseña sin la base de datos.' });
  }
  const { actual, nueva } = req.body;
  if (!actual || !nueva || String(nueva).length < 6) {
    return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres.' });
  }

  const user = await userRepository.findByIdWithPassword(req.session.user.id_usuario);
  const ok = await bcrypt.compare(actual, user.contrasena);
  if (!ok) {
    return res.status(400).json({ message: 'La contraseña actual no es correcta.' });
  }

  const hash = await bcrypt.hash(nueva, 10);
  await userRepository.update(user.id_usuario, { contrasena: hash });
  await logService.registrar(user.id_usuario, 'cambio contraseña', req, `${user.nombre} ${user.apellido} cambió su contraseña`);
  res.json({ message: 'Contraseña actualizada correctamente.' });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { nombre, apellido } = req.body;
  if (!nombre || !apellido) {
    return res.status(400).json({ message: 'Nombre y apellido son obligatorios.' });
  }
  const updated = await userRepository.update(req.session.user.id_usuario, { nombre, apellido });
  req.session.user = publicUser({ ...req.session.user, ...updated });
  res.json({ user: req.session.user });
});

const professionals = asyncHandler(async (_req, res) => {
  const usuarios = await userRepository.listAll();
  res.json({
    usuarios: usuarios.filter((u) => u.rol === 'psicopedagoga' || u.rol === 'administrador')
  });
});

module.exports = { login, logout, me, changePassword, updateProfile, professionals };

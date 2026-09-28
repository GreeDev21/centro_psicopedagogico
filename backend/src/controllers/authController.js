const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');
const logService = require('../services/logService');
const { publicUser } = require('../utils/http');
const { asyncHandler } = require('../utils/asyncHandler');

const login = asyncHandler(async (req, res) => {
  const correo = String(req.body.correo || '').trim().toLowerCase();
  const contrasena = String(req.body.contrasena || '');

  if (!correo || !contrasena) {
    return res.status(400).json({ message: 'Ingrese correo y contraseña.' });
  }

  const user = await userRepository.findByCorreo(correo);
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
  if (user) {
    await logService.registrar(user.id_usuario, 'logout', req, `${user.nombre} ${user.apellido} cerró sesión`);
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

const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');
const logService = require('../services/logService');
const { asyncHandler } = require('../utils/asyncHandler');

const ROLES = new Set(['psicopedagoga', 'administrador']);

const list = asyncHandler(async (_req, res) => {
  res.json({ usuarios: await userRepository.listAll() });
});

const create = asyncHandler(async (req, res) => {
  const { nombre, apellido, correo, contrasena, rol } = req.body;
  if (!nombre || !apellido || !correo || !contrasena || !rol) {
    return res.status(400).json({ message: 'Complete todos los campos del usuario.' });
  }
  if (!ROLES.has(rol)) {
    return res.status(400).json({ message: 'El rol indicado no es válido.' });
  }
  if (String(contrasena).length < 6) {
    return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres.' });
  }

  const exists = await userRepository.findByCorreo(String(correo).trim().toLowerCase());
  if (exists) {
    return res.status(409).json({ message: 'Ya existe un usuario con ese correo.' });
  }

  const hash = await bcrypt.hash(contrasena, 10);
  const user = await userRepository.create({
    nombre,
    apellido,
    correo: String(correo).trim().toLowerCase(),
    contrasena: hash,
    rol
  });
  await logService.registrar(req.session.user.id_usuario, 'alta usuario', req, `Se creó el usuario ${user.correo}`);
  res.status(201).json({ usuario: user });
});

const update = asyncHandler(async (req, res) => {
  const { nombre, apellido, correo, rol, contrasena } = req.body;
  const current = await userRepository.findById(req.params.id);
  if (!current) {
    return res.status(404).json({ message: 'Usuario no encontrado.' });
  }
  if (rol && !ROLES.has(rol)) {
    return res.status(400).json({ message: 'El rol indicado no es válido.' });
  }

  const payload = { nombre, apellido, correo: correo ? String(correo).trim().toLowerCase() : undefined, rol };
  if (contrasena) {
    if (String(contrasena).length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres.' });
    }
    payload.contrasena = await bcrypt.hash(contrasena, 10);
  }

  const user = await userRepository.update(req.params.id, payload);
  await logService.registrar(req.session.user.id_usuario, 'edición usuario', req, `Se actualizó el usuario ${user.correo}`);
  res.json({ usuario: user });
});

const remove = asyncHandler(async (req, res) => {
  if (String(req.session.user.id_usuario) === String(req.params.id)) {
    return res.status(400).json({ message: 'No puede eliminar su propio usuario.' });
  }
  const current = await userRepository.findById(req.params.id);
  if (!current) {
    return res.status(404).json({ message: 'Usuario no encontrado.' });
  }
  await userRepository.remove(req.params.id);
  await logService.registrar(req.session.user.id_usuario, 'baja usuario', req, `Se eliminó el usuario ${current.correo}`);
  res.json({ ok: true });
});

const logs = asyncHandler(async (_req, res) => {
  res.json({ logs: await logService.listar() });
});

module.exports = { list, create, update, remove, logs };

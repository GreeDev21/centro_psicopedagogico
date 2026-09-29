const appointmentRepository = require('../repositories/appointmentRepository');
const { getReport } = require('../reports');
const { asyncHandler } = require('../utils/asyncHandler');
const { validarAgenda, normalizarHora, hoyLocal } = require('../utils/agenda');

const ESTADOS = new Set(['pendiente', 'confirmado', 'cancelado', 'realizado']);

function validate(body, actual) {
  if (!body.id_paciente || !body.id_usuario || !body.fecha_turno || !body.hora_turno) {
    return 'Paciente, profesional, fecha y hora son obligatorios.';
  }
  if (body.estado && !ESTADOS.has(body.estado)) {
    return 'El estado del turno no es válido.';
  }
  const agenda = validarAgenda(body.fecha_turno, body.hora_turno, actual?.fecha_turno);
  if (agenda) return agenda;
  const fecha = String(body.fecha_turno).slice(0, 10);
  if (actual && fecha < hoyLocal() && body.estado && body.estado !== actual.estado) {
    return 'No se puede cambiar el estado de un turno anterior a hoy.';
  }
  body.hora_turno = normalizarHora(body.hora_turno);
  return null;
}

const list = asyncHandler(async (req, res) => {
  const turnos = await appointmentRepository.listAll({
    desde: req.query.desde,
    hasta: req.query.hasta,
    idUsuario: req.query.id_usuario,
    estado: req.query.estado
  });
  res.json({ turnos });
});

const upcoming = asyncHandler(async (_req, res) => {
  res.json({ turnos: await appointmentRepository.proximos(10) });
});

const getOne = asyncHandler(async (req, res) => {
  const turno = await appointmentRepository.findById(req.params.id);
  if (!turno) return res.status(404).json({ message: 'Turno no encontrado.' });
  res.json({ turno });
});

const create = asyncHandler(async (req, res) => {
  const error = validate(req.body);
  if (error) return res.status(400).json({ message: error });
  try {
    const turno = await appointmentRepository.create(req.body);
    res.status(201).json({ turno });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Ese paciente ya tiene un turno en la misma fecha y hora.' });
    }
    throw err;
  }
});

const update = asyncHandler(async (req, res) => {
  const current = await appointmentRepository.findById(req.params.id);
  if (!current) return res.status(404).json({ message: 'Turno no encontrado.' });
  const error = validate(req.body, current);
  if (error) return res.status(400).json({ message: error });
  const turno = await appointmentRepository.update(req.params.id, req.body);
  res.json({ turno });
});

const remove = asyncHandler(async (req, res) => {
  const current = await appointmentRepository.findById(req.params.id);
  if (!current) return res.status(404).json({ message: 'Turno no encontrado.' });
  await appointmentRepository.remove(req.params.id);
  res.json({ ok: true });
});

const pdf = asyncHandler(async (req, res) => {
  const turnos = await appointmentRepository.listAll({
    desde: req.query.desde,
    hasta: req.query.hasta,
    idUsuario: req.query.id_usuario,
    estado: req.query.estado
  });
  if (!turnos.length) {
    return res.status(404).json({ message: 'No hay turnos para exportar con esos criterios.' });
  }
  getReport('agenda').generate({
    turnos,
    desde: req.query.desde,
    hasta: req.query.hasta
  }, res);
});

module.exports = { list, upcoming, getOne, create, update, remove, pdf };

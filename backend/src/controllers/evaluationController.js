const path = require('path');
const fs = require('fs');
const evaluationRepository = require('../repositories/evaluationRepository');
const patientRepository = require('../repositories/patientRepository');
const { normalizarDni } = require('./patientController');
const { getReport } = require('../reports');
const { asyncHandler } = require('../utils/asyncHandler');

const CLINICAL_FIELDS = [
  'motivo_consulta',
  'desarrollo_lenguaje',
  'desarrollo_motor',
  'alimentacion',
  'sueno',
  'tiempo_libre',
  'juego',
  'observaciones'
];

const LENGUAJE = new Set(['Bajo', 'Por encima del promedio', 'Óptimo', 'Avanzado']);
const ALIMENTACION = new Set(['A considerar', 'Aceptable']);
const SUENO = new Set(['Escaso', 'Interrumpido', 'Aceptable']);

function normalizeEnum(value, allowed) {
  if (value === undefined || value === null || value === '') return null;
  if (value === 'Avanzado para la edad') return 'Avanzado';
  if (!allowed.has(value)) {
    const error = new Error(`Valor no permitido: ${value}`);
    error.status = 400;
    throw error;
  }
  return value;
}

function hasClinicalData(body) {
  return CLINICAL_FIELDS.some((field) => {
    const value = body[field];
    return value !== undefined && value !== null && String(value).trim() !== '';
  });
}

async function resolvePatient(body, files) {
  if (body.id_paciente) {
    const existing = await patientRepository.findById(body.id_paciente);
    if (!existing) {
      const error = new Error('El paciente seleccionado no existe.');
      error.status = 400;
      throw error;
    }
    return existing.id_paciente;
  }

  if (body.paciente_nombre && body.paciente_apellido && body.fecha_nacimiento) {
    const dni = normalizarDni(body.paciente_dni);
    if (dni.error) {
      const error = new Error(dni.error);
      error.status = 400;
      throw error;
    }
    const created = await patientRepository.create({
      nombre: body.paciente_nombre,
      apellido: body.paciente_apellido,
      dni: dni.dni,
      fecha_nacimiento: body.fecha_nacimiento,
      telefono: body.paciente_telefono,
      correo: body.paciente_correo,
      direccion: body.paciente_direccion
    });
    return created.id_paciente;
  }

  const error = new Error('Debe seleccionar un paciente o registrar uno nuevo.');
  error.status = 400;
  throw error;
}

function payloadFromBody(body, idUsuario, idPaciente) {
  if (!body.fecha_evaluacion) {
    const error = new Error('La fecha de evaluación es obligatoria.');
    error.status = 400;
    throw error;
  }
  if (!hasClinicalData(body)) {
    const error = new Error('Debe completar al menos uno de los campos clínicos de la evaluación.');
    error.status = 400;
    throw error;
  }

  return {
    id_paciente: idPaciente,
    id_usuario: idUsuario,
    fecha_evaluacion: body.fecha_evaluacion,
    motivo_consulta: body.motivo_consulta,
    desarrollo_lenguaje: normalizeEnum(body.desarrollo_lenguaje, LENGUAJE),
    desarrollo_motor: body.desarrollo_motor,
    alimentacion: normalizeEnum(body.alimentacion, ALIMENTACION),
    sueno: normalizeEnum(body.sueno, SUENO),
    tiempo_libre: body.tiempo_libre,
    juego: body.juego,
    observaciones: body.observaciones
  };
}

async function attachFiles(idEvaluacion, files = []) {
  for (const file of files) {
    await evaluationRepository.addArchivo(
      idEvaluacion,
      `/uploads/evaluaciones/${file.filename}`,
      file.mimetype
    );
  }
}

const list = asyncHandler(async (req, res) => {
  const evaluaciones = await evaluationRepository.listAll({
    nombre: req.query.nombre,
    desde: req.query.desde,
    hasta: req.query.hasta,
    idPaciente: req.query.id_paciente
  });
  res.json({ evaluaciones });
});

const getOne = asyncHandler(async (req, res) => {
  const evaluacion = await evaluationRepository.findById(req.params.id);
  if (!evaluacion) return res.status(404).json({ message: 'Evaluación no encontrada.' });
  res.json({ evaluacion });
});

const create = asyncHandler(async (req, res) => {
  const idPaciente = await resolvePatient(req.body, req.files);
  const data = payloadFromBody(req.body, req.session.user.id_usuario, idPaciente);
  const evaluacion = await evaluationRepository.create(data);
  await attachFiles(evaluacion.id_evaluacion, req.files);
  res.status(201).json({ evaluacion: await evaluationRepository.findById(evaluacion.id_evaluacion) });
});

const update = asyncHandler(async (req, res) => {
  const current = await evaluationRepository.findById(req.params.id);
  if (!current) return res.status(404).json({ message: 'Evaluación no encontrada.' });

  if (req.session.user.rol !== 'administrador' && current.id_usuario !== req.session.user.id_usuario) {
    return res.status(403).json({ message: 'Solo puede editar las evaluaciones que registró.' });
  }

  const idPaciente = Number(req.body.id_paciente) || current.id_paciente;
  const data = payloadFromBody(req.body, current.id_usuario, idPaciente);
  await evaluationRepository.update(req.params.id, data);
  await attachFiles(current.id_evaluacion, req.files);
  res.json({ evaluacion: await evaluationRepository.findById(req.params.id) });
});

const remove = asyncHandler(async (req, res) => {
  const current = await evaluationRepository.findById(req.params.id);
  if (!current) return res.status(404).json({ message: 'Evaluación no encontrada.' });
  if (req.session.user.rol !== 'administrador' && current.id_usuario !== req.session.user.id_usuario) {
    return res.status(403).json({ message: 'Solo puede eliminar las evaluaciones que registró.' });
  }
  await evaluationRepository.remove(req.params.id);
  res.json({ ok: true });
});

const pdfOne = asyncHandler(async (req, res) => {
  const evaluacion = await evaluationRepository.findById(req.params.id);
  if (!evaluacion) return res.status(404).json({ message: 'Evaluación no encontrada.' });
  getReport('evaluacion').generate(evaluacion, res);
});

const pdfHistory = asyncHandler(async (req, res) => {
  const evaluaciones = await evaluationRepository.listAll({
    nombre: req.query.nombre,
    desde: req.query.desde,
    hasta: req.query.hasta,
    idPaciente: req.query.id_paciente
  });
  if (!evaluaciones.length) {
    return res.status(404).json({ message: 'No hay evaluaciones para exportar con esos criterios.' });
  }
  getReport('historial').generate({
    pacienteLabel: req.query.nombre || 'Búsqueda por período',
    desde: req.query.desde,
    hasta: req.query.hasta,
    evaluaciones
  }, res);
});

const removeFile = asyncHandler(async (req, res) => {
  const archivo = await evaluationRepository.findArchivo(req.params.idArchivo);
  if (!archivo) return res.status(404).json({ message: 'Archivo no encontrado.' });
  const full = path.join(__dirname, '../../uploads/evaluaciones', path.basename(archivo.path_archivo));
  if (fs.existsSync(full)) fs.unlinkSync(full);
  await evaluationRepository.removeArchivo(req.params.idArchivo);
  res.json({ ok: true });
});

module.exports = { list, getOne, create, update, remove, pdfOne, pdfHistory, removeFile };

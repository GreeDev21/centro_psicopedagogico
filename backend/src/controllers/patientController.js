const patientRepository = require('../repositories/patientRepository');
const { asyncHandler } = require('../utils/asyncHandler');

function normalizarDni(valor) {
  if (valor === undefined || valor === null || String(valor).trim() === '') return null;
  const digits = String(valor).replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 8) {
    return { error: 'El DNI debe tener 7 u 8 números.' };
  }
  return { dni: digits };
}

function validatePatient(body) {
  const { nombre, apellido, fecha_nacimiento } = body;
  if (!nombre || !apellido || !fecha_nacimiento) {
    return 'Nombre, apellido y fecha de nacimiento son obligatorios.';
  }
  const dni = normalizarDni(body.dni);
  if (dni.error) return dni.error;
  body.dni = dni.dni;
  return null;
}

const list = asyncHandler(async (req, res) => {
  const pacientes = await patientRepository.listAll(req.query.q);
  res.json({ pacientes });
});

const getOne = asyncHandler(async (req, res) => {
  const paciente = await patientRepository.findById(req.params.id);
  if (!paciente) return res.status(404).json({ message: 'Paciente no encontrado.' });
  res.json({ paciente });
});

const create = asyncHandler(async (req, res) => {
  const error = validatePatient(req.body);
  if (error) return res.status(400).json({ message: error });
  const paciente = await patientRepository.create(req.body);
  res.status(201).json({ paciente });
});

const update = asyncHandler(async (req, res) => {
  const current = await patientRepository.findById(req.params.id);
  if (!current) return res.status(404).json({ message: 'Paciente no encontrado.' });
  const error = validatePatient(req.body);
  if (error) return res.status(400).json({ message: error });
  const paciente = await patientRepository.update(req.params.id, req.body);
  res.json({ paciente });
});

const remove = asyncHandler(async (req, res) => {
  const current = await patientRepository.findById(req.params.id);
  if (!current) return res.status(404).json({ message: 'Paciente no encontrado.' });
  await patientRepository.remove(req.params.id);
  res.json({ ok: true });
});

module.exports = { list, getOne, create, update, remove, normalizarDni };

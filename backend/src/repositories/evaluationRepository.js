const { query } = require('../config/db');
const { calcularEdadCronologica } = require('../utils/age');

function withEdad(row) {
  if (!row) return null;
  const edad = calcularEdadCronologica(row.fecha_nacimiento, row.fecha_evaluacion);
  return { ...row, edad_cronologica: edad };
}

async function listAll({ nombre, desde, hasta, idPaciente } = {}) {
  const where = [];
  const params = [];

  if (idPaciente) {
    where.push('e.id_paciente = ?');
    params.push(idPaciente);
  }
  if (nombre) {
    const tokens = String(nombre).trim().split(/\s+/).filter(Boolean);
    for (const token of tokens) {
      const like = `%${token}%`;
      const digits = token.replace(/\D/g, '');
      where.push(`(
        p.nombre LIKE ? OR p.apellido LIKE ?
        OR CONCAT(p.apellido, ' ', p.nombre) LIKE ?
        OR CONCAT(p.nombre, ' ', p.apellido) LIKE ?
        OR (? <> '' AND REPLACE(REPLACE(IFNULL(p.dni, ''), '.', ''), '-', '') LIKE ?)
      )`);
      params.push(like, like, like, like, digits, digits ? `%${digits}%` : '');
    }
  }
  if (desde) {
    where.push('e.fecha_evaluacion >= ?');
    params.push(desde);
  }
  if (hasta) {
    where.push('e.fecha_evaluacion <= ?');
    params.push(hasta);
  }

  const sql = `
    SELECT e.*, p.nombre AS paciente_nombre, p.apellido AS paciente_apellido,
           p.fecha_nacimiento, p.telefono AS paciente_telefono, p.correo AS paciente_correo,
           u.nombre AS profesional_nombre, u.apellido AS profesional_apellido
    FROM evaluaciones e
    INNER JOIN pacientes p ON p.id_paciente = e.id_paciente
    INNER JOIN usuarios u ON u.id_usuario = e.id_usuario
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY e.fecha_evaluacion DESC, e.id_evaluacion DESC
  `;
  const rows = await query(sql, params);
  return rows.map(withEdad);
}

async function findById(id) {
  const rows = await query(
    `SELECT e.*, p.nombre AS paciente_nombre, p.apellido AS paciente_apellido,
            p.fecha_nacimiento, p.telefono AS paciente_telefono, p.correo AS paciente_correo,
            p.direccion AS paciente_direccion,
            u.nombre AS profesional_nombre, u.apellido AS profesional_apellido
     FROM evaluaciones e
     INNER JOIN pacientes p ON p.id_paciente = e.id_paciente
     INNER JOIN usuarios u ON u.id_usuario = e.id_usuario
     WHERE e.id_evaluacion = ? LIMIT 1`,
    [id]
  );
  const evaluacion = withEdad(rows[0]);
  if (!evaluacion) return null;
  evaluacion.archivos = await listArchivos(id);
  return evaluacion;
}

async function create(data) {
  const result = await query(
    `INSERT INTO evaluaciones
      (id_paciente, id_usuario, fecha_evaluacion, motivo_consulta, desarrollo_lenguaje,
       desarrollo_motor, alimentacion, sueno, tiempo_libre, juego, observaciones)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.id_paciente,
      data.id_usuario,
      data.fecha_evaluacion,
      data.motivo_consulta || null,
      data.desarrollo_lenguaje || null,
      data.desarrollo_motor || null,
      data.alimentacion || null,
      data.sueno || null,
      data.tiempo_libre || null,
      data.juego || null,
      data.observaciones || null
    ]
  );
  return findById(result.insertId);
}

async function update(id, data) {
  await query(
    `UPDATE evaluaciones SET
      id_paciente = ?, fecha_evaluacion = ?, motivo_consulta = ?, desarrollo_lenguaje = ?,
      desarrollo_motor = ?, alimentacion = ?, sueno = ?, tiempo_libre = ?, juego = ?, observaciones = ?
     WHERE id_evaluacion = ?`,
    [
      data.id_paciente,
      data.fecha_evaluacion,
      data.motivo_consulta || null,
      data.desarrollo_lenguaje || null,
      data.desarrollo_motor || null,
      data.alimentacion || null,
      data.sueno || null,
      data.tiempo_libre || null,
      data.juego || null,
      data.observaciones || null,
      id
    ]
  );
  return findById(id);
}

async function remove(id) {
  await query('DELETE FROM evaluaciones WHERE id_evaluacion = ?', [id]);
}

async function addArchivo(idEvaluacion, pathArchivo, tipo) {
  await query(
    'INSERT INTO archivos_evaluacion (id_evaluacion, path_archivo, tipo) VALUES (?, ?, ?)',
    [idEvaluacion, pathArchivo, tipo]
  );
}

async function listArchivos(idEvaluacion) {
  return query(
    'SELECT * FROM archivos_evaluacion WHERE id_evaluacion = ? ORDER BY fecha_subida',
    [idEvaluacion]
  );
}

async function findArchivo(idArchivo) {
  const rows = await query('SELECT * FROM archivos_evaluacion WHERE id_archivo = ? LIMIT 1', [idArchivo]);
  return rows[0] || null;
}

async function removeArchivo(idArchivo) {
  await query('DELETE FROM archivos_evaluacion WHERE id_archivo = ?', [idArchivo]);
}

module.exports = {
  listAll,
  findById,
  create,
  update,
  remove,
  addArchivo,
  listArchivos,
  findArchivo,
  removeArchivo
};

const { query } = require('../config/db');

async function listAll({ desde, hasta, idUsuario, estado } = {}) {
  const where = [];
  const params = [];
  if (desde) {
    where.push('t.fecha_turno >= ?');
    params.push(desde);
  }
  if (hasta) {
    where.push('t.fecha_turno <= ?');
    params.push(hasta);
  }
  if (idUsuario) {
    where.push('t.id_usuario = ?');
    params.push(idUsuario);
  }
  if (estado) {
    where.push('t.estado = ?');
    params.push(estado);
  }

  return query(
    `SELECT t.*, p.nombre AS paciente_nombre, p.apellido AS paciente_apellido,
            u.nombre AS profesional_nombre, u.apellido AS profesional_apellido
     FROM turnos t
     INNER JOIN pacientes p ON p.id_paciente = t.id_paciente
     INNER JOIN usuarios u ON u.id_usuario = t.id_usuario
     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY t.fecha_turno, t.hora_turno`,
    params
  );
}

async function findById(id) {
  const rows = await query(
    `SELECT t.*, p.nombre AS paciente_nombre, p.apellido AS paciente_apellido,
            u.nombre AS profesional_nombre, u.apellido AS profesional_apellido
     FROM turnos t
     INNER JOIN pacientes p ON p.id_paciente = t.id_paciente
     INNER JOIN usuarios u ON u.id_usuario = t.id_usuario
     WHERE t.id_turno = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function create(data) {
  const result = await query(
    `INSERT INTO turnos (id_paciente, id_usuario, fecha_turno, hora_turno, motivo, estado)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [data.id_paciente, data.id_usuario, data.fecha_turno, data.hora_turno, data.motivo || null, data.estado || 'pendiente']
  );
  return findById(result.insertId);
}

async function update(id, data) {
  await query(
    `UPDATE turnos
     SET id_paciente = ?, id_usuario = ?, fecha_turno = ?, hora_turno = ?, motivo = ?, estado = ?
     WHERE id_turno = ?`,
    [data.id_paciente, data.id_usuario, data.fecha_turno, data.hora_turno, data.motivo || null, data.estado, id]
  );
  return findById(id);
}

async function remove(id) {
  await query('DELETE FROM turnos WHERE id_turno = ?', [id]);
}

async function proximos(limit = 8) {
  return query(
    `SELECT t.*, p.nombre AS paciente_nombre, p.apellido AS paciente_apellido,
            u.nombre AS profesional_nombre, u.apellido AS profesional_apellido
     FROM turnos t
     INNER JOIN pacientes p ON p.id_paciente = t.id_paciente
     INNER JOIN usuarios u ON u.id_usuario = t.id_usuario
     WHERE t.fecha_turno >= CURDATE() AND t.estado IN ('pendiente', 'confirmado')
     ORDER BY t.fecha_turno, t.hora_turno
     LIMIT ${Number(limit)}`
  );
}

module.exports = { listAll, findById, create, update, remove, proximos };

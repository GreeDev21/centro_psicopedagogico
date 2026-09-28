const { query } = require('../config/db');

async function listAll(search) {
  const texto = String(search || '').trim();
  if (!texto) {
    return query('SELECT * FROM pacientes ORDER BY apellido, nombre');
  }

  const where = [];
  const params = [];
  for (const token of texto.split(/\s+/)) {
    const like = `%${token}%`;
    const digits = token.replace(/\D/g, '');
    where.push(`(
      nombre LIKE ? OR apellido LIKE ? OR correo LIKE ?
      OR CONCAT(apellido, ' ', nombre) LIKE ?
      OR CONCAT(nombre, ' ', apellido) LIKE ?
      OR (? <> '' AND REPLACE(REPLACE(IFNULL(dni, ''), '.', ''), '-', '') LIKE ?)
    )`);
    params.push(like, like, like, like, like, digits, digits ? `%${digits}%` : '');
  }

  return query(
    `SELECT * FROM pacientes WHERE ${where.join(' AND ')} ORDER BY apellido, nombre`,
    params
  );
}

async function findById(id) {
  const rows = await query('SELECT * FROM pacientes WHERE id_paciente = ? LIMIT 1', [id]);
  return rows[0] || null;
}

async function create(data) {
  const result = await query(
    `INSERT INTO pacientes (nombre, apellido, dni, fecha_nacimiento, telefono, correo, direccion)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [data.nombre, data.apellido, data.dni || null, data.fecha_nacimiento, data.telefono || null, data.correo || null, data.direccion || null]
  );
  return findById(result.insertId);
}

async function update(id, data) {
  await query(
    `UPDATE pacientes
     SET nombre = ?, apellido = ?, dni = ?, fecha_nacimiento = ?, telefono = ?, correo = ?, direccion = ?
     WHERE id_paciente = ?`,
    [data.nombre, data.apellido, data.dni || null, data.fecha_nacimiento, data.telefono || null, data.correo || null, data.direccion || null, id]
  );
  return findById(id);
}

async function remove(id) {
  await query('DELETE FROM pacientes WHERE id_paciente = ?', [id]);
}

module.exports = { listAll, findById, create, update, remove };

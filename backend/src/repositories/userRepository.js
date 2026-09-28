const { query } = require('../config/db');

async function findByCorreo(correo) {
  const rows = await query('SELECT * FROM usuarios WHERE correo = ? LIMIT 1', [correo]);
  return rows[0] || null;
}

async function findById(id) {
  const rows = await query(
    'SELECT id_usuario, nombre, apellido, correo, rol FROM usuarios WHERE id_usuario = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
}

async function findByIdWithPassword(id) {
  const rows = await query('SELECT * FROM usuarios WHERE id_usuario = ? LIMIT 1', [id]);
  return rows[0] || null;
}

async function listAll() {
  return query(
    'SELECT id_usuario, nombre, apellido, correo, rol FROM usuarios ORDER BY apellido, nombre'
  );
}

async function create(data) {
  const result = await query(
    `INSERT INTO usuarios (nombre, apellido, correo, contrasena, rol)
     VALUES (?, ?, ?, ?, ?)`,
    [data.nombre, data.apellido, data.correo, data.contrasena, data.rol]
  );
  return findById(result.insertId);
}

async function update(id, data) {
  const fields = [];
  const values = [];
  for (const key of ['nombre', 'apellido', 'correo', 'rol', 'contrasena']) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    }
  }
  if (!fields.length) return findById(id);
  values.push(id);
  await query(`UPDATE usuarios SET ${fields.join(', ')} WHERE id_usuario = ?`, values);
  return findById(id);
}

async function remove(id) {
  await query('DELETE FROM usuarios WHERE id_usuario = ?', [id]);
}

module.exports = { findByCorreo, findById, findByIdWithPassword, listAll, create, update, remove };

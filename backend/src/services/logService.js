const { query } = require('../config/db');
const { clientIp } = require('../utils/http');

async function registrar(idUsuario, accion, req, detalle) {
  await query(
    `INSERT INTO logs_acceso (id_usuario, accion, ip, detalle) VALUES (?, ?, ?, ?)`,
    [idUsuario, accion, clientIp(req), detalle || null]
  );
}

async function listar(limit = 80) {
  return query(
    `SELECT l.*, u.nombre, u.apellido, u.correo
     FROM logs_acceso l
     INNER JOIN usuarios u ON u.id_usuario = l.id_usuario
     ORDER BY l.fecha_hora DESC
     LIMIT ${Number(limit)}`
  );
}

module.exports = { registrar, listar };

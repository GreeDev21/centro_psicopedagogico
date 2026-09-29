const crypto = require('crypto');

function adminDeRespaldo() {
  const correo = String(process.env.ADMIN_CORREO || '').trim().toLowerCase();
  const contrasena = String(process.env.ADMIN_PASSWORD || '');
  if (!correo || !contrasena) return null;
  return {
    id_usuario: 0,
    nombre: process.env.ADMIN_NOMBRE || 'Admin',
    apellido: process.env.ADMIN_APELLIDO || 'General',
    correo,
    rol: 'administrador',
    contrasena
  };
}

function claveCoincide(ingresada, guardada) {
  const izquierda = Buffer.from(String(ingresada));
  const derecha = Buffer.from(String(guardada));
  if (izquierda.length !== derecha.length) return false;
  return crypto.timingSafeEqual(izquierda, derecha);
}

module.exports = { adminDeRespaldo, claveCoincide };

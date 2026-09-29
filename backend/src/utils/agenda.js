const agenda = require('../../../shared/agenda.json');

const HORARIOS = new Set([...agenda.manana, ...agenda.tarde]);

function normalizarHora(hora) {
  const match = String(hora || '').match(/^(\d{1,2}):(\d{2})/);
  if (!match) return '';
  return `${match[1].padStart(2, '0')}:${match[2]}`;
}

function diaDeSemana(fecha) {
  const match = String(fecha || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return date.getDay();
}

function hoyLocal() {
  const date = new Date();
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const dia = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${mes}-${dia}`;
}

function validarAgenda(fecha, hora, fechaOriginal) {
  const dia = diaDeSemana(fecha);
  if (dia === null) return 'La fecha del turno no es válida.';
  const iso = String(fecha).slice(0, 10);
  const original = fechaOriginal ? String(fechaOriginal).slice(0, 10) : '';
  if (iso < hoyLocal() && iso !== original) {
    return 'No se pueden fijar turnos en una fecha anterior a hoy.';
  }
  if (dia === 0 || dia === 6) return 'Los turnos son solo de lunes a viernes.';
  if (!HORARIOS.has(normalizarHora(hora))) {
    return 'El horario debe ser cada 30 minutos, de 8:00 a 11:30 o de 15:00 a 20:00.';
  }
  return null;
}

module.exports = { HORARIOS, normalizarHora, validarAgenda, hoyLocal };

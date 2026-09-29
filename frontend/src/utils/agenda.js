import agenda from '../../../shared/agenda.json';

export const HORARIOS_MANANA = agenda.manana;
export const HORARIOS_TARDE = agenda.tarde;
export const HORARIOS = [...agenda.manana, ...agenda.tarde];

export function esDiaHabil(fecha) {
  const match = String(fecha || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return false;
  const dia = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])).getDay();
  return dia >= 1 && dia <= 5;
}

export function hoyLocal(from = new Date()) {
  const mes = String(from.getMonth() + 1).padStart(2, '0');
  const dia = String(from.getDate()).padStart(2, '0');
  return `${from.getFullYear()}-${mes}-${dia}`;
}

export function proximoDiaHabil(from = new Date()) {
  const date = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  while (date.getDay() === 0 || date.getDay() === 6) date.setDate(date.getDate() + 1);
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const dia = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${mes}-${dia}`;
}

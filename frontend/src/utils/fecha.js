const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function partes(iso) {
  if (!iso) return null;
  const [anio, mes, dia] = String(iso).slice(0, 10).split('-').map(Number);
  if (!anio || !mes || !dia) return null;
  return { anio, mes, dia };
}

export function hoyISO() {
  const ahora = new Date();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  return `${ahora.getFullYear()}-${mes}-${dia}`;
}

export function fechaCorta(iso) {
  const p = partes(iso);
  if (!p) return '—';
  if (String(iso).slice(0, 10) === hoyISO()) return 'Hoy';
  return `${p.dia} ${MESES[p.mes - 1]}`;
}

export function fechaConAnio(iso) {
  const p = partes(iso);
  if (!p) return '—';
  if (String(iso).slice(0, 10) === hoyISO()) return 'Hoy';
  return `${p.dia} ${MESES[p.mes - 1]} ${p.anio}`;
}

export function fechaLarga(fecha = new Date()) {
  const texto = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(fecha);
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function saludo(fecha = new Date()) {
  const hora = fecha.getHours();
  if (hora < 12) return 'Buenos días';
  if (hora < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

export async function api(path, { method = 'GET', body, isForm } = {}) {
  const options = {
    method,
    credentials: 'include',
    headers: {}
  };

  if (body !== undefined) {
    if (isForm) {
      options.body = body;
    } else {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }
  }

  const res = await fetch(path, options);
  const contentType = res.headers.get('content-type') || '';

  if (contentType.includes('application/pdf')) {
    if (!res.ok) {
      throw new Error('No se pudo generar el PDF.');
    }
    return res.blob();
  }

  const data = contentType.includes('application/json') ? await res.json() : null;
  if (!res.ok) {
    throw new Error(data?.message || 'Ocurrió un error al procesar la solicitud.');
  }
  return data;
}

export async function downloadPdf(path, filename) {
  const blob = await api(path);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const LENGUAJE_OPTIONS = [
  { value: 'Bajo', label: 'Bajo' },
  { value: 'Por encima del promedio', label: 'Por encima del promedio' },
  { value: 'Óptimo', label: 'Óptimo' },
  { value: 'Avanzado', label: 'Avanzado para la edad' }
];

export const ALIMENTACION_OPTIONS = ['A considerar', 'Aceptable'];
export const SUENO_OPTIONS = ['Escaso', 'Interrumpido', 'Aceptable'];
export const ESTADO_TURNO = ['pendiente', 'confirmado', 'cancelado', 'realizado'];

export function etiquetaLenguaje(valor) {
  return valor === 'Avanzado' ? 'Avanzado para la edad' : valor || '—';
}

export function horaCorta(valor) {
  return String(valor || '').slice(0, 5);
}

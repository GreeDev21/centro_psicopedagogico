function calcularEdadCronologica(fechaNacimiento, fechaReferencia) {
  if (!fechaNacimiento || !fechaReferencia) {
    return { anios: null, meses: null, etiqueta: '—' };
  }

  const nacimiento = new Date(`${fechaNacimiento}T00:00:00`);
  const referencia = new Date(`${fechaReferencia}T00:00:00`);
  if (Number.isNaN(nacimiento.getTime()) || Number.isNaN(referencia.getTime())) {
    return { anios: null, meses: null, etiqueta: '—' };
  }

  let anios = referencia.getFullYear() - nacimiento.getFullYear();
  let meses = referencia.getMonth() - nacimiento.getMonth();

  if (referencia.getDate() < nacimiento.getDate()) {
    meses -= 1;
  }
  if (meses < 0) {
    anios -= 1;
    meses += 12;
  }

  const etiqueta = `${anios} ${anios === 1 ? 'año' : 'años'} y ${meses} ${meses === 1 ? 'mes' : 'meses'}`;
  return { anios, meses, etiqueta };
}

function rangoEtario(anios) {
  if (anios == null) return 'Sin dato';
  if (anios < 6) return '3 a 5 años';
  if (anios < 9) return '6 a 8 años';
  if (anios < 12) return '9 a 11 años';
  return '12 a 15 años';
}

module.exports = { calcularEdadCronologica, rangoEtario };

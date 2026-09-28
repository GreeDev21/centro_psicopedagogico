const { query } = require('../config/db');
const { calcularEdadCronologica, rangoEtario } = require('../utils/age');

async function resumen() {
  const [totales] = await query(`
    SELECT
      (SELECT COUNT(*) FROM evaluaciones) AS total_evaluaciones,
      (SELECT COUNT(*) FROM pacientes) AS total_pacientes,
      (SELECT COUNT(*) FROM turnos) AS total_turnos,
      (SELECT COUNT(*) FROM usuarios WHERE rol = 'psicopedagoga') AS total_profesionales
  `);

  const lenguaje = await query(`
    SELECT desarrollo_lenguaje AS etiqueta, COUNT(*) AS cantidad
    FROM evaluaciones
    WHERE desarrollo_lenguaje IS NOT NULL
    GROUP BY desarrollo_lenguaje
  `);

  const alimentacion = await query(`
    SELECT alimentacion AS etiqueta, COUNT(*) AS cantidad
    FROM evaluaciones
    WHERE alimentacion IS NOT NULL
    GROUP BY alimentacion
  `);

  const sueno = await query(`
    SELECT sueno AS etiqueta, COUNT(*) AS cantidad
    FROM evaluaciones
    WHERE sueno IS NOT NULL
    GROUP BY sueno
  `);

  const porProfesional = await query(`
    SELECT CONCAT(u.nombre, ' ', u.apellido) AS profesional, COUNT(*) AS cantidad
    FROM evaluaciones e
    INNER JOIN usuarios u ON u.id_usuario = e.id_usuario
    GROUP BY e.id_usuario, u.nombre, u.apellido
    ORDER BY cantidad DESC
  `);

  const porMes = await query(`
    SELECT DATE_FORMAT(fecha_evaluacion, '%Y-%m') AS mes, COUNT(*) AS cantidad
    FROM evaluaciones
    GROUP BY DATE_FORMAT(fecha_evaluacion, '%Y-%m')
    ORDER BY mes
  `);

  const turnosEstado = await query(`
    SELECT estado AS etiqueta, COUNT(*) AS cantidad
    FROM turnos
    GROUP BY estado
  `);

  const edades = await query(`
    SELECT p.fecha_nacimiento, e.fecha_evaluacion
    FROM evaluaciones e
    INNER JOIN pacientes p ON p.id_paciente = e.id_paciente
  `);

  const rangos = {};
  for (const row of edades) {
    const { anios } = calcularEdadCronologica(row.fecha_nacimiento, row.fecha_evaluacion);
    const clave = rangoEtario(anios);
    rangos[clave] = (rangos[clave] || 0) + 1;
  }

  const rangoEtarioData = Object.entries(rangos)
    .map(([etiqueta, cantidad]) => ({ etiqueta, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad);

  const totalLenguaje = lenguaje.reduce((acc, item) => acc + Number(item.cantidad), 0);
  const lenguajeConPorcentaje = lenguaje.map((item) => ({
    ...item,
    porcentaje: totalLenguaje ? Number(((item.cantidad / totalLenguaje) * 100).toFixed(1)) : 0
  }));

  return {
    totales,
    lenguaje: lenguajeConPorcentaje,
    alimentacion,
    sueno,
    porProfesional,
    porMes,
    turnosEstado,
    rangoEtario: rangoEtarioData,
    rangoMayorIncidencia: rangoEtarioData[0] || null
  };
}

module.exports = { resumen };

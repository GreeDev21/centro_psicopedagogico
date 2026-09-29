require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

const dbName = process.env.DB_NAME || 'centro_psicopedagogico';

const baseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true,
  charset: 'utf8mb4'
};

const usuarios = [
  ['Carlos', 'Ramírez', 'c.ramirez@centro.com', 'hash123', 'psicopedagoga'],
  ['María', 'Gómez', 'm.gomez@centro.com', 'hash123', 'psicopedagoga'],
  ['Lucía', 'Fernández', 'l.fernandez@centro.com', 'hash123', 'psicopedagoga'],
  ['Ana', 'Martínez', 'a.martinez@centro.com', 'hash123', 'psicopedagoga'],
  ['Admin', 'General', 'admin@centro.com', 'Admin1234', 'administrador']
];

const pacientes = [
  ['Juan', 'Pérez', '2015-03-12', '3764000001', 'juan.perez@mail.com', 'Calle 1'],
  ['Sofía', 'López', '2014-07-25', '3764000002', 'sofia.lopez@mail.com', 'Calle 2'],
  ['Martín', 'García', '2016-01-10', '3764000003', 'martin.garcia@mail.com', 'Calle 3'],
  ['Valentina', 'Rodríguez', '2013-11-05', '3764000004', 'valentina.rodriguez@mail.com', 'Calle 4'],
  ['Tomás', 'Fernández', '2015-09-18', '3764000005', 'tomas.fernandez@mail.com', 'Calle 5'],
  ['Camila', 'Gómez', '2012-02-22', '3764000006', 'camila.gomez@mail.com', 'Calle 6'],
  ['Mateo', 'Martínez', '2014-12-30', '3764000007', 'mateo.martinez@mail.com', 'Calle 7'],
  ['Isabella', 'Ramírez', '2016-06-14', '3764000008', 'isabella.ramirez@mail.com', 'Calle 8'],
  ['Benjamín', 'Torres', '2013-04-09', '3764000009', 'benjamin.torres@mail.com', 'Calle 9'],
  ['Mía', 'Flores', '2015-08-21', '3764000010', 'mia.flores@mail.com', 'Calle 10'],
  ['Lucas', 'Díaz', '2012-10-01', '3764000011', 'lucas.diaz@mail.com', 'Calle 11'],
  ['Emma', 'Morales', '2014-05-17', '3764000012', 'emma.morales@mail.com', 'Calle 12'],
  ['Thiago', 'Suárez', '2013-09-23', '3764000013', 'thiago.suarez@mail.com', 'Calle 13'],
  ['Catalina', 'Rivas', '2016-12-11', '3764000014', 'catalina.rivas@mail.com', 'Calle 14'],
  ['Santiago', 'Navarro', '2015-07-07', '3764000015', 'santiago.navarro@mail.com', 'Calle 15'],
  ['Renata', 'Silva', '2012-01-19', '3764000016', 'renata.silva@mail.com', 'Calle 16'],
  ['Julián', 'Castro', '2013-03-28', '3764000017', 'julian.castro@mail.com', 'Calle 17'],
  ['Abril', 'Mendoza', '2014-11-02', '3764000018', 'abril.mendoza@mail.com', 'Calle 18'],
  ['Franco', 'Ortiz', '2016-08-15', '3764000019', 'franco.ortiz@mail.com', 'Calle 19'],
  ['Paula', 'Domínguez', '2015-04-27', '3764000020', 'paula.dominguez@mail.com', 'Calle 20']
];

const lenguajes = ['Bajo', 'Por encima del promedio', 'Óptimo', 'Avanzado'];
const alimentaciones = ['A considerar', 'Aceptable'];
const suenos = ['Escaso', 'Interrumpido', 'Aceptable'];
const motos = [
  'Motricidad fina adecuada para la edad, con leve dificultad en el recorte.',
  'Buen equilibrio y coordinación general. Lateralidad definida.',
  'Tono muscular dentro de parámetros esperados. Grafomotricidad en proceso.',
  'Dificultades en coordinación visomotora. Se sugiere trabajo específico.',
  'Habilidades motoras gruesas destacadas. Precisión fina en mejora.'
];
const motivos = [
  'Dificultades en lenguaje oral',
  'Seguimiento de tratamiento',
  'Consulta por lectoescritura',
  'Dificultades atencionales',
  'Orientación escolar',
  'Retraso en adquisición de lectoescritura',
  'Evaluación inicial',
  'Derivación institucional'
];
const tiempos = [
  'Juega fútbol con pares del barrio.',
  'Dibuja y arma construcciones en casa.',
  'Mira contenidos infantiles y comparte juegos de mesa.',
  'Prefiere actividades al aire libre con hermanos.',
  'Dedica tiempo a lectura guiada y juegos simbólicos.'
];
const juegos = [
  'Se adapta bien a las consignas y sostiene la atención.',
  'Requiere apoyo para iniciar, luego logra buenos resultados.',
  'Juego simbólico rico; le cuesta ceder turnos.',
  'Disfruta propuestas cooperativas y completa las actividades.',
  'Oscila entre interés alto y abandono precoz de la tarea.'
];
const observaciones = [
  'Se recomienda seguimiento quincenal y trabajo con familia.',
  'Mejoría notable respecto de la evaluación anterior.',
  'Incorporar estrategias de regulación emocional en sesión.',
  'Coordinar con la escuela para apoyos en el aula.',
  'Continuar plan de intervención en lenguaje y motricidad fina.'
];

function pick(list, index) {
  return list[index % list.length];
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function evaluationDate(patientIndex, evalIndex) {
  const year = 2025 + Math.floor((patientIndex + evalIndex) / 18);
  const month = ((patientIndex * 2 + evalIndex * 3) % 12) + 1;
  const day = ((patientIndex + evalIndex * 5) % 27) + 1;
  const safeYear = Math.min(year, 2026);
  const safeMonth = safeYear === 2026 ? Math.min(month, 9) : month;
  return `${safeYear}-${pad(safeMonth)}-${pad(day)}`;
}

async function run() {
  const schemaSql = fs.readFileSync(
    path.join(__dirname, '../../../database/schema.sql'),
    'utf8'
  );

  const root = await mysql.createConnection(baseConfig);
  await root.query(schemaSql);
  await root.end();

  const conn = await mysql.createConnection({ ...baseConfig, database: dbName });
  await conn.query('SET FOREIGN_KEY_CHECKS = 0');
  await conn.query('TRUNCATE TABLE archivos_evaluacion');
  await conn.query('TRUNCATE TABLE logs_acceso');
  await conn.query('TRUNCATE TABLE turnos');
  await conn.query('TRUNCATE TABLE evaluaciones');
  await conn.query('TRUNCATE TABLE pacientes');
  await conn.query('TRUNCATE TABLE usuarios');
  await conn.query('SET FOREIGN_KEY_CHECKS = 1');

  for (const [nombre, apellido, correo, clave, rol] of usuarios) {
    const hash = await bcrypt.hash(clave, 10);
    await conn.query(
      'INSERT INTO usuarios (nombre, apellido, correo, contrasena, rol) VALUES (?, ?, ?, ?, ?)',
      [nombre, apellido, correo, hash, rol]
    );
  }

  for (const [index, row] of pacientes.entries()) {
    const dni = String(45000001 + index);
    await conn.query(
      'INSERT INTO pacientes (nombre, apellido, dni, fecha_nacimiento, telefono, correo, direccion) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [row[0], row[1], dni, row[2], row[3], row[4], row[5]]
    );
  }

  for (let p = 1; p <= 20; p += 1) {
    for (let e = 0; e < 5; e += 1) {
      const i = (p - 1) * 5 + e;
      const profesional = (i % 4) + 1;
      await conn.query(
        `INSERT INTO evaluaciones
          (id_paciente, id_usuario, fecha_evaluacion, motivo_consulta, desarrollo_lenguaje,
           desarrollo_motor, alimentacion, sueno, tiempo_libre, juego, observaciones)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p,
          profesional,
          evaluationDate(p, e),
          pick(motivos, i),
          pick(lenguajes, i + p),
          pick(motos, i),
          pick(alimentaciones, i),
          pick(suenos, i + 1),
          pick(tiempos, i),
          pick(juegos, i + 2),
          pick(observaciones, i)
        ]
      );
    }
  }

  const turnos = [
    [1, 1, '2026-09-28', '17:30:00', 'Evaluación de seguimiento', 'confirmado'],
    [2, 2, '2026-09-28', '18:00:00', 'Consulta de lenguaje', 'pendiente'],
    [3, 3, '2026-09-29', '16:00:00', 'Evaluación inicial', 'confirmado'],
    [4, 4, '2026-09-29', '17:00:00', 'Devolución familiar', 'pendiente'],
    [5, 1, '2026-09-30', '15:30:00', 'Trabajo de lectoescritura', 'confirmado'],
    [6, 2, '2026-09-30', '18:30:00', 'Seguimiento atencional', 'pendiente'],
    [7, 3, '2026-10-01', '16:30:00', 'Evaluación motriz', 'confirmado'],
    [8, 4, '2026-10-01', '19:00:00', 'Orientación escolar', 'pendiente'],
    [9, 1, '2026-10-02', '17:00:00', 'Seguimiento', 'confirmado'],
    [10, 2, '2026-10-05', '16:00:00', 'Consulta inicial', 'pendiente'],
    [11, 3, '2026-09-21', '17:30:00', 'Evaluación inicial', 'realizado'],
    [12, 4, '2026-09-22', '18:00:00', 'Seguimiento', 'realizado'],
    [13, 1, '2026-09-23', '16:00:00', 'Devolución', 'cancelado'],
    [14, 2, '2026-09-24', '17:00:00', 'Consulta motriz', 'realizado'],
    [15, 3, '2026-10-06', '18:00:00', 'Seguimiento de lenguaje', 'pendiente'],
    [16, 4, '2026-10-07', '15:00:00', 'Evaluación integral', 'confirmado'],
    [17, 1, '2026-10-08', '16:30:00', 'Apoyo escolar', 'pendiente'],
    [18, 2, '2026-10-09', '17:30:00', 'Consulta familiar', 'confirmado'],
    [19, 3, '2026-10-12', '18:30:00', 'Seguimiento', 'pendiente'],
    [20, 4, '2026-10-13', '16:00:00', 'Evaluación de cierre', 'confirmado'],
    [1, 2, '2026-10-14', '17:00:00', 'Control de avances', 'pendiente'],
    [3, 1, '2026-10-15', '18:00:00', 'Juego y lenguaje', 'confirmado'],
    [5, 3, '2026-09-18', '16:30:00', 'Evaluación inicial', 'realizado'],
    [8, 1, '2026-09-21', '19:00:00', 'Orientación', 'cancelado']
  ];

  for (const row of turnos) {
    await conn.query(
      'INSERT INTO turnos (id_paciente, id_usuario, fecha_turno, hora_turno, motivo, estado) VALUES (?, ?, ?, ?, ?, ?)',
      row
    );
  }

  await conn.query(
    `INSERT INTO logs_acceso (id_usuario, accion, ip, detalle) VALUES
     (5, 'login', '192.168.0.10', 'Administrador ingresó al sistema'),
     (1, 'cambio contraseña', '192.168.0.11', 'Usuario Carlos Ramírez cambió su contraseña'),
     (2, 'logout', '192.168.0.12', 'Usuario María Gómez cerró sesión')`
  );

  await conn.end();
  console.log('Base de datos centro_psicopedagogico lista con datos de ejemplo.');
  console.log('Admin: admin@centro.com / Admin1234');
  console.log('Profesional: c.ramirez@centro.com / hash123');
}

run().catch((error) => {
  console.error('Error al inicializar la base de datos:', error);
  process.exit(1);
});

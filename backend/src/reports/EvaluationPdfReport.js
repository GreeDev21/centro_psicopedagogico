const path = require('path');
const fs = require('fs');
const { ReportGenerator } = require('./ReportGenerator');

class EvaluationPdfReport extends ReportGenerator {
  generate(evaluacion, res) {
    const doc = this.createDoc();
    const nombre = `${evaluacion.paciente_apellido}, ${evaluacion.paciente_nombre}`;
    this.pipeToResponse(doc, res, `evaluacion-${evaluacion.id_evaluacion}.pdf`);
    this.header(doc, 'Informe de evaluación psicopedagógica', `N.º ${evaluacion.id_evaluacion}`);

    this.sectionTitle(doc, 'Datos del paciente');
    this.kv(doc, 'Nombre completo', nombre);
    this.kv(doc, 'Edad cronológica', evaluacion.edad_cronologica?.etiqueta);
    this.kv(doc, 'Fecha de nacimiento', evaluacion.fecha_nacimiento);
    this.kv(doc, 'Fecha de evaluación', evaluacion.fecha_evaluacion);
    this.kv(doc, 'Profesional a cargo', `${evaluacion.profesional_nombre} ${evaluacion.profesional_apellido}`);

    this.sectionTitle(doc, 'Motivo inicial de la consulta');
    doc.font('Helvetica').fontSize(10).text(evaluacion.motivo_consulta || '—', { paragraphGap: 8 });

    this.sectionTitle(doc, 'Desarrollo');
    this.kv(doc, 'Desarrollo del lenguaje', evaluacion.desarrollo_lenguaje === 'Avanzado'
      ? 'Avanzado para la edad'
      : evaluacion.desarrollo_lenguaje);
    this.kv(doc, 'Desarrollo motor', evaluacion.desarrollo_motor);
    this.kv(doc, 'Alimentación', evaluacion.alimentacion);
    this.kv(doc, 'Sueño', evaluacion.sueno);
    this.kv(doc, 'Tiempo libre', evaluacion.tiempo_libre);
    this.kv(doc, 'Juego', evaluacion.juego);

    this.sectionTitle(doc, 'Otras observaciones');
    doc.font('Helvetica').fontSize(10).text(evaluacion.observaciones || '—', { paragraphGap: 10 });

    if (evaluacion.archivos?.length) {
      this.sectionTitle(doc, 'Producciones adjuntas');
      for (const archivo of evaluacion.archivos) {
        const full = path.join(__dirname, '../../uploads/evaluaciones', path.basename(archivo.path_archivo));
        if (fs.existsSync(full)) {
          try {
            if (doc.y > 640) doc.addPage();
            doc.image(full, { fit: [240, 180], align: 'left' });
            doc.moveDown(0.6);
          } catch (_error) {
            doc.fontSize(9).text(`Archivo: ${archivo.path_archivo}`);
          }
        }
      }
    }

    this.footer(doc);
    doc.end();
  }
}

module.exports = { EvaluationPdfReport };

const { ReportGenerator } = require('./ReportGenerator');

class HistoryPdfReport extends ReportGenerator {
  generate({ pacienteLabel, desde, hasta, evaluaciones }, res) {
    const doc = this.createDoc();
    this.pipeToResponse(doc, res, 'historial-paciente.pdf');
    this.header(
      doc,
      'Historial de evaluaciones',
      [pacienteLabel, desde && `Desde ${desde}`, hasta && `Hasta ${hasta}`].filter(Boolean).join(' · ')
    );

    doc.font('Helvetica').fontSize(10)
      .text(`Se encontraron ${evaluaciones.length} evaluación(es).`, { paragraphGap: 12 });

    evaluaciones.forEach((item, index) => {
      if (doc.y > 680) doc.addPage();
      this.sectionTitle(doc, `${index + 1}. ${item.fecha_evaluacion} · ${item.paciente_apellido}, ${item.paciente_nombre}`);
      this.kv(doc, 'Edad cronológica', item.edad_cronologica?.etiqueta);
      this.kv(doc, 'Profesional', `${item.profesional_nombre} ${item.profesional_apellido}`);
      this.kv(doc, 'Motivo', item.motivo_consulta);
      this.kv(doc, 'Lenguaje', item.desarrollo_lenguaje === 'Avanzado' ? 'Avanzado para la edad' : item.desarrollo_lenguaje);
      this.kv(doc, 'Alimentación', item.alimentacion);
      this.kv(doc, 'Sueño', item.sueno);
      this.kv(doc, 'Observaciones', item.observaciones);
    });

    this.footer(doc);
    doc.end();
  }
}

module.exports = { HistoryPdfReport };

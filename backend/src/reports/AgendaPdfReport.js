const { ReportGenerator } = require('./ReportGenerator');

class AgendaPdfReport extends ReportGenerator {
  generate({ turnos, desde, hasta }, res) {
    const doc = this.createDoc();
    this.pipeToResponse(doc, res, 'agenda-turnos.pdf');
    this.header(
      doc,
      'Agenda de turnos',
      [desde && `Desde ${desde}`, hasta && `Hasta ${hasta}`].filter(Boolean).join(' · ') || 'Listado completo'
    );

    doc.font('Helvetica').fontSize(10).text(`Total de turnos: ${turnos.length}`, { paragraphGap: 10 });

    const colX = [48, 118, 168, 310, 430, 510];
    const headers = ['Fecha', 'Hora', 'Paciente', 'Profesional', 'Estado'];

    const drawTableHeader = () => {
      doc.rect(48, doc.y, 500, 20).fill(this.colores.azul);
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(8);
      headers.forEach((h, i) => doc.text(h, colX[i], doc.y - 14, { width: 110 }));
      doc.moveDown(0.6);
    };

    drawTableHeader();

    turnos.forEach((turno, index) => {
      if (doc.y > 740) {
        doc.addPage();
        doc.y = 60;
        drawTableHeader();
      }
      if (index % 2 === 0) {
        doc.rect(48, doc.y - 4, 500, 18).fill(this.colores.gris);
      }
      doc.fillColor(this.colores.texto).font('Helvetica').fontSize(8);
      const hora = String(turno.hora_turno).slice(0, 5);
      const vals = [
        turno.fecha_turno,
        hora,
        `${turno.paciente_apellido}, ${turno.paciente_nombre}`,
        `${turno.profesional_nombre} ${turno.profesional_apellido}`,
        turno.estado
      ];
      const y = doc.y;
      vals.forEach((v, i) => doc.text(String(v), colX[i], y, { width: i === 2 || i === 3 ? 110 : 70 }));
      doc.y = y + 16;
    });

    this.footer(doc);
    doc.end();
  }
}

module.exports = { AgendaPdfReport };

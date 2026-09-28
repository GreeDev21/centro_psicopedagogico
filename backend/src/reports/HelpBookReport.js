const { ReportGenerator } = require('./ReportGenerator');

class HelpBookReport extends ReportGenerator {
  ensureSpace(doc, needed = 80) {
    if (doc.y + needed > doc.page.height - 64) {
      doc.addPage();
      doc.y = 56;
    }
  }

  drawBlocks(doc, capitulo) {
    doc.fillColor(this.colores.verde).font('Helvetica-Bold').fontSize(9)
      .text((capitulo.kicker || '').toUpperCase(), { characterSpacing: 1 });
    doc.fillColor(this.colores.oscuro).font('Helvetica-Bold').fontSize(18)
      .text(capitulo.titulo, { paragraphGap: 4 });
    if (capitulo.rol === 'administrador') {
      doc.fillColor('#8a6a1f').font('Helvetica').fontSize(9)
        .text('Capítulo reservado a la administración.', { paragraphGap: 6 });
    }
    doc.fillColor(this.colores.texto).font('Helvetica-Oblique').fontSize(11)
      .text(capitulo.resumen || '', { paragraphGap: 10 });

    for (const bloque of capitulo.bloques || []) {
      this.ensureSpace(doc, 70);
      if (bloque.titulo) {
        doc.fillColor(this.colores.oscuro).font('Helvetica-Bold').fontSize(12)
          .text(bloque.titulo, { paragraphGap: 4 });
      }
      if (bloque.tipo === 'parrafo') {
        doc.fillColor(this.colores.texto).font('Helvetica').fontSize(11)
          .text(bloque.texto, { align: 'justify', paragraphGap: 8 });
      }
      if (bloque.tipo === 'nota') {
        this.ensureSpace(doc, 70);
        const y = doc.y;
        doc.font('Helvetica').fontSize(10);
        const height = doc.heightOfString(bloque.texto, { width: doc.page.width - 120 }) + 16;
        doc.rect(doc.page.margins.left, y, doc.page.width - 96, height).fill('#fff4dc');
        doc.fillColor('#6d5314').text(bloque.texto, doc.page.margins.left + 10, y + 8, {
          width: doc.page.width - 116
        });
        doc.y = y + height + 10;
        doc.fillColor(this.colores.texto);
      }
      if (bloque.tipo === 'pasos' || bloque.tipo === 'lista') {
        (bloque.items || []).forEach((item, index) => {
          this.ensureSpace(doc, 28);
          const marca = bloque.tipo === 'pasos' ? `${index + 1}.` : '·';
          doc.fillColor(this.colores.oscuro).font('Helvetica-Bold').fontSize(11)
            .text(marca, doc.page.margins.left, doc.y, { continued: true, width: 22 });
          doc.fillColor(this.colores.texto).font('Helvetica')
            .text(`  ${item}`, { paragraphGap: 3 });
        });
        doc.moveDown(0.4);
      }
    }
  }

  generate({ capitulos, completo }, res) {
    const doc = this.createDoc();
    const filename = completo ? 'manual-centro-psicopedagogico.pdf' : `ayuda-${capitulos[0].id}.pdf`;
    this.pipeToResponse(doc, res, filename);

    if (completo) {
      this.header(doc, 'Cuaderno de ayuda', 'Manual de uso del sistema');
      doc.fillColor(this.colores.oscuro).font('Helvetica-Bold').fontSize(22)
        .text('Manual del Centro Psicopedagógico', { paragraphGap: 8 });
      doc.font('Helvetica').fontSize(12).fillColor(this.colores.texto)
        .text('Este documento reúne el oficio del cuaderno: ingreso, legajos, historial, retrato del centro y turnera.', { paragraphGap: 8 });
      doc.font('Helvetica').fontSize(11).fillColor(this.colores.oscuro)
        .text('Desarrollo: Burgos Agustín y Pintos Julio · Webxpert · www.webxpert.com.ar', { paragraphGap: 12 });
      doc.font('Helvetica-Bold').fontSize(12).fillColor(this.colores.oscuro).text('Índice', { paragraphGap: 6 });
      capitulos.forEach((cap, index) => {
        doc.font('Helvetica').fontSize(11).fillColor(this.colores.texto)
          .text(`${index + 1}.  ${cap.titulo}`, { paragraphGap: 2 });
      });
    }

    capitulos.forEach((cap, index) => {
      if (completo || index > 0) doc.addPage();
      if (!completo && index === 0) {
        this.header(doc, 'Cuaderno de ayuda', cap.titulo);
      }
      doc.y = completo || index > 0 ? 56 : doc.y;
      this.drawBlocks(doc, cap);
    });

    this.footer(doc);
    doc.end();
  }
}

module.exports = { HelpBookReport };

const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');

const LOGO_PATH = path.join(__dirname, '../../assets/logo.png');

class ReportGenerator {
  constructor() {
    this.colores = {
      azul: '#4A90E2',
      verde: '#7ED6A5',
      amarillo: '#F5C469',
      gris: '#F2F2F2',
      texto: '#2C3E50',
      oscuro: '#1B2A4A'
    };
  }

  createDoc() {
    return new PDFDocument({
      size: 'A4',
      margin: 48,
      bufferPages: true,
      info: {
        Author: 'Centro Psicopedagógico',
        Creator: 'Sistema de gestión institucional'
      }
    });
  }

  header(doc, titulo, subtitulo) {
    doc.rect(0, 0, doc.page.width, 92).fill(this.colores.oscuro);

    if (fs.existsSync(LOGO_PATH)) {
      try {
        doc.image(LOGO_PATH, 36, 10, { height: 72 });
      } catch (_error) {
        doc.fillColor('#FFFFFF').fontSize(12).text('Centro Psicopedagógico', 40, 32);
      }
    }

    doc.fillColor('#FFFFFF')
      .font('Helvetica-Bold')
      .fontSize(16)
      .text('Centro Psicopedagógico', 130, 28, { width: 400 });
    doc.font('Helvetica')
      .fontSize(10)
      .fillColor('#7ED6A5')
      .text(titulo, 130, 50, { width: 400 });
    if (subtitulo) {
      doc.fillColor('#F5C469').fontSize(9).text(subtitulo, 130, 66, { width: 400 });
    }
    doc.moveDown();
    doc.y = 118;
    doc.fillColor(this.colores.texto);
  }

  footer(doc) {
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i += 1) {
      doc.switchToPage(i);
      doc.rect(0, doc.page.height - 36, doc.page.width, 36).fill(this.colores.azul);
      doc.fillColor('#FFFFFF')
        .fontSize(8)
        .text(
          `Documento institucional · ${new Date().toLocaleDateString('es-AR')} · Página ${i + 1} de ${range.count}`,
          48,
          doc.page.height - 24,
          { width: doc.page.width - 96, align: 'center' }
        );
    }
  }

  kv(doc, label, value) {
    doc.font('Helvetica-Bold').fontSize(10).fillColor(this.colores.azul).text(label, { continued: false });
    doc.font('Helvetica').fontSize(10).fillColor(this.colores.texto).text(value || '—', { paragraphGap: 6 });
  }

  sectionTitle(doc, title) {
    doc.moveDown(0.4);
    doc.rect(doc.page.margins.left, doc.y, doc.page.width - 96, 22).fill(this.colores.gris);
    doc.fillColor(this.colores.oscuro).font('Helvetica-Bold').fontSize(11).text(title, doc.page.margins.left + 8, doc.y + 5);
    doc.moveDown(1.2);
    doc.fillColor(this.colores.texto);
  }

  pipeToResponse(doc, res, filename) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    doc.pipe(res);
  }

  generate() {
    throw new Error('generate() debe implementarse en la subclase');
  }
}

module.exports = { ReportGenerator };

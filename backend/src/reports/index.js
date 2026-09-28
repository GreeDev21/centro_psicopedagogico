const { EvaluationPdfReport } = require('./EvaluationPdfReport');
const { HistoryPdfReport } = require('./HistoryPdfReport');
const { AgendaPdfReport } = require('./AgendaPdfReport');

const reports = {
  evaluacion: new EvaluationPdfReport(),
  historial: new HistoryPdfReport(),
  agenda: new AgendaPdfReport()
};

function getReport(tipo) {
  const report = reports[tipo];
  if (!report) {
    throw new Error(`No existe un generador de reportes para "${tipo}".`);
  }
  return report;
}

module.exports = { getReport, reports };

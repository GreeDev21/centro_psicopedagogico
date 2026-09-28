function errorHandler(err, _req, res, _next) {
  console.error(err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'La imagen supera el tamaño máximo de 6 MB.' });
  }
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'El registro ya existe o hay un conflicto de unicidad.' });
  }
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Error interno del servidor.'
  });
}

module.exports = { errorHandler };

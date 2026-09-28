const statsService = require('../services/statsService');
const { asyncHandler } = require('../utils/asyncHandler');

const getStats = asyncHandler(async (_req, res) => {
  res.json(await statsService.resumen());
});

module.exports = { getStats };

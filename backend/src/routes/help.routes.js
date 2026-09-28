const express = require('express');
const path = require('path');
const { requireAuth } = require('../middlewares/auth');
const { HelpBookReport } = require('../reports/HelpBookReport');

const manual = require(path.join(__dirname, '../../../shared/manual.json'));
const router = express.Router();

router.use(requireAuth);

router.get('/pdf', (_req, res) => {
  new HelpBookReport().generate({ capitulos: manual.capitulos, completo: true }, res);
});

router.get('/pdf/:id', (req, res) => {
  const capitulo = manual.capitulos.find((item) => item.id === req.params.id);
  if (!capitulo) {
    return res.status(404).json({ message: 'Ese capítulo no está en el manual.' });
  }
  new HelpBookReport().generate({ capitulos: [capitulo], completo: false }, res);
});

module.exports = router;

const express = require('express');
const { requireAuth } = require('../middlewares/auth');
const statsController = require('../controllers/statsController');

const router = express.Router();

router.get('/', requireAuth, statsController.getStats);

module.exports = router;

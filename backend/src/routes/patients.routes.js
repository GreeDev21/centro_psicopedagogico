const express = require('express');
const { requireAuth, requireAdmin } = require('../middlewares/auth');
const patientController = require('../controllers/patientController');

const router = express.Router();

router.use(requireAuth);
router.get('/', patientController.list);
router.get('/:id', patientController.getOne);
router.post('/', patientController.create);
router.put('/:id', patientController.update);
router.delete('/:id', requireAdmin, patientController.remove);

module.exports = router;

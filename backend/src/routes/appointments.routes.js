const express = require('express');
const { requireAuth } = require('../middlewares/auth');
const appointmentController = require('../controllers/appointmentController');

const router = express.Router();

router.use(requireAuth);
router.get('/', appointmentController.list);
router.get('/proximos', appointmentController.upcoming);
router.get('/pdf', appointmentController.pdf);
router.get('/:id', appointmentController.getOne);
router.post('/', appointmentController.create);
router.put('/:id', appointmentController.update);
router.delete('/:id', appointmentController.remove);

module.exports = router;

const express = require('express');
const { requireAuth, requireAdmin } = require('../middlewares/auth');
const userController = require('../controllers/userController');

const router = express.Router();

router.use(requireAuth, requireAdmin);
router.get('/', userController.list);
router.post('/', userController.create);
router.put('/:id', userController.update);
router.delete('/:id', userController.remove);
router.get('/logs/acceso', userController.logs);

module.exports = router;

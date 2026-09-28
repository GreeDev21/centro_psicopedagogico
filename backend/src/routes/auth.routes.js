const express = require('express');
const { requireAuth } = require('../middlewares/auth');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/login', authController.login);
router.post('/logout', requireAuth, authController.logout);
router.get('/me', requireAuth, authController.me);
router.put('/password', requireAuth, authController.changePassword);
router.put('/perfil', requireAuth, authController.updateProfile);
router.get('/profesionales', requireAuth, authController.professionals);

module.exports = router;

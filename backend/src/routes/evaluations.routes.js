const express = require('express');
const { requireAuth } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');
const evaluationController = require('../controllers/evaluationController');

const router = express.Router();

router.use(requireAuth);
router.get('/', evaluationController.list);
router.get('/historial/pdf', evaluationController.pdfHistory);
router.get('/:id/pdf', evaluationController.pdfOne);
router.get('/:id', evaluationController.getOne);
router.post('/', upload.array('imagenes', 8), evaluationController.create);
router.put('/:id', upload.array('imagenes', 8), evaluationController.update);
router.delete('/archivo/:idArchivo', evaluationController.removeFile);
router.delete('/:id', evaluationController.remove);

module.exports = router;

const express = require('express');
const router = express.Router();
const reunionesController = require('../controllers/reunionesController');

// Rutas especiales
router.get('/new', reunionesController.new);
router.get('/mis-inscripciones', reunionesController.misInscripciones);
router.get('/historial', reunionesController.historial);
router.get('/gestionar', reunionesController.gestionar);

// CRUD básico
router.get('/', reunionesController.index);
router.post('/', reunionesController.create);
router.get('/:id', reunionesController.show);
router.get('/:id/edit', reunionesController.edit);
router.put('/:id', reunionesController.update);
router.delete('/:id', reunionesController.delete);

// Acciones de cliente
router.post('/:id/inscribirse', reunionesController.inscribirse);
router.post('/:id/cancelar', reunionesController.cancelarInscripcion);

// Ver participantes
router.get('/:id/participantes', reunionesController.participantes);

module.exports = router;
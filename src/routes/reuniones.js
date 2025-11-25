const express = require('express');
const router = express.Router()
const reunionesController = require('../controllers/reunionesController')

// Ruta para el Catalogo de reuniones
router.get('/', reunionesController.index)

// Ruta para la creacion de reuniones (Deberia ser solo para vendedor y admin)
router.get('/new', reunionesController.new)
router.post('/', reunionesController.create)

// Ruta para ver mis inscripciones (como cliente)
router.get('/mis-inscripciones', reunionesController.misInscripciones)

// Muestra 1 reunión en base a su id (Deberia ser solo para vendedor y admin)
router.get('/:id', reunionesController.show);

// Rutas para actualizar datos (Deberia ser solo para vendedor y admin)
router.get('/:id/edit', reunionesController.edit);
router.put('/:id', reunionesController.update);

// Ruta para eliminar (Deberia ser solo para vendedor y admin)
router.delete('/:id', reunionesController.delete);

// Inscribirse a una reunión
router.post('/:id/inscribirse', reunionesController.inscribirse);
// Cancelar inscripción
router.post('/:id/cancelar', reunionesController.cancelarInscripcion);

// Ver lista de participantes de una reunión (Deberia ser solo para vendedor y admin)
router.get('/:id/participantes', reunionesController.participantes);

module.exports = router
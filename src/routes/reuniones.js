const express = require('express')
const router = express.Router()
const reunionesController = require('../controllers/reunionesController')
const { requireAuth, requireRole } = require('../middlewares/authMiddleware')

// Ruta para el Catalogo de reuniones
router.get('/', reunionesController.index)

// Ruta para la creacion de reuniones (solo vendedor y admin)
router.get('/new', reunionesController.new)
router.post('/', reunionesController.create)

// Ruta para ver mis inscripciones (como cliente)
router.get('/mis-inscripciones', reunionesController.misInscripciones)

// Ruta para ver historial (como cliente)
router.get('/historial', reunionesController.historial)

// Ruta para gestionar reuniones (solo vendedor y admin)
router.get('/gestionar', reunionesController.gestionar)

// Muestra 1 reunión en base a su id
router.get('/:id', reunionesController.show)

// Rutas para actualizar datos (solo vendedor y admin)
router.get('/:id/edit', reunionesController.edit)
router.put('/:id', reunionesController.update)

// Ruta para eliminar (solo vendedor y admin)
router.delete('/:id', reunionesController.delete)

// Inscribirse a una reunión
router.post('/:id/inscribirse', reunionesController.inscribirse)

// Cancelar inscripción
router.post('/:id/cancelar', reunionesController.cancelarInscripcion)

// Ver lista de participantes de una reunión (solo vendedor y admin)
router.get('/:id/participantes', reunionesController.participantes)

module.exports = router
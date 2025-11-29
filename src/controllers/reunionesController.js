const { Reunion, Usuario, UsuarioReunion } = require('../models/associations')
const { requireAuth, requireRole } = require('../middlewares/authMiddleware')
const { Op } = require('sequelize')

// GET /reuniones - Catálogo de reuniones disponibles
exports.index = [
    requireAuth,
    async (req, res, next) => {
        try {
            const reuniones = await Reunion.findAll({
                where: {
                    estado: 'programada',
                    fecha: {
                        [Op.gte]: new Date()
                    }
                },
                include: [{
                    model: Usuario,
                    as: 'vendedor',
                    attributes: ['id', 'nombre']
                }],
                order: [['fecha', 'ASC'], ['hora', 'ASC']],
                raw: true,
                nest: true
            })

            // Filtrar solo reuniones sin cliente
            const reunionesDisponibles = []
            for (const reunion of reuniones) {
                const tieneCliente = await UsuarioReunion.findOne({
                    where: {
                        reunionId: reunion.id,
                        estado: {
                            [Op.in]: ['inscrito', 'confirmado']
                        }
                    }
                })
                if (!tieneCliente) {
                    reunionesDisponibles.push(reunion)
                }
            }

            const { success } = req.query
            const { error } = req.query
            res.render('reuniones/index', { reuniones: reunionesDisponibles, success, error })
        } catch (error) {
            next(error)
        }
    }
]

// GET /reuniones/:id - Ver detalle de reunión
exports.show = [
    requireAuth,
    async (req, res, next) => {
        try {
            const { id } = req.params
            const { success } = req.query

            const reunion = await Reunion.findByPk(id, {
                include: [{
                    model: Usuario,
                    as: 'vendedor',
                    attributes: ['id', 'nombre', 'email']
                }]
            })

            if (!reunion) return res.status(404).send(`Reunión con el id: ${id} no encontrada`)

            // Verificar si tiene cliente
            const tieneCliente = await UsuarioReunion.findOne({
                where: {
                    reunionId: id,
                    estado: {
                        [Op.in]: ['inscrito', 'confirmado']
                    }
                }
            })

            // Verificar si el usuario actual está inscrito
            let yaInscrito = false
            const inscripcion = await UsuarioReunion.findOne({
                where: {
                    usuarioId: req.auth.id,
                    reunionId: id,
                    estado: {
                        [Op.in]: ['inscrito', 'confirmado']
                    }
                }
            })
            yaInscrito = !!inscripcion

            const reunionPlana = {
                ...reunion.get({ plain: true }),
                disponible: !tieneCliente
            }

            res.render('reuniones/show', { reunion: reunionPlana, yaInscrito, success })
        } catch (error) {
            next(error)
        }
    }
]

// GET /reuniones/new - Formulario crear reunión
exports.new = [
    requireAuth,
    requireRole('vendedor', 'admin'),
    async (req, res, next) => {
        res.render('reuniones/new')
    }
]

// POST /reuniones - Crear reunión
exports.create = [
    requireAuth,
    requireRole('vendedor', 'admin'),
    async (req, res, next) => {
        try {
            const { titulo, descripcion, fecha, hora, duracion } = req.body

            if (!titulo || !fecha || !hora) {
                return res.status(400).send('Título, fecha y hora son obligatorios')
            }

            const nuevaReunion = await Reunion.create({
                titulo,
                descripcion,
                fecha,
                hora,
                duracion: parseInt(duracion) || 60,
                vendedorId: req.auth.id,
                estado: 'programada'
            })

            console.log('Reunión creada exitosamente', nuevaReunion)

            const msg = encodeURIComponent('Reunión creada exitosamente')
            res.redirect(`/reuniones/gestionar?success=${msg}`)
        } catch (error) {
            next(error)
        }
    }
]

// GET /reuniones/:id/edit - Formulario editar
exports.edit = [
    requireAuth,
    requireRole('vendedor', 'admin'),
    async (req, res, next) => {
        try {
            const reunion = await Reunion.findByPk(req.params.id)

            if (!reunion) return res.status(404).send('Reunión no encontrada')

            // Verificar permisos: solo el vendedor dueño o admin
            if (req.auth.rol === 'vendedor' && reunion.vendedorId !== req.auth.id) {
                return res.status(403).send('No puedes editar reuniones de otros vendedores')
            }

            const reunionPlana = {
                ...reunion.get({ plain: true })
            }

            const estados = ['programada', 'en_curso', 'finalizada', 'cancelada'].map(estado => ({
                value: estado,
                selected: estado === reunionPlana.estado
            }))

            res.render('reuniones/edit', { reunion: reunionPlana, estados })
        } catch (error) {
            next(error)
        }
    }
]

// PUT /reuniones/:id - Actualizar reunión
exports.update = [
    requireAuth,
    requireRole('vendedor', 'admin'),
    async (req, res, next) => {
        try {
            const { id } = req.params
            const { titulo, descripcion, fecha, hora, duracion, estado } = req.body

            const reunion = await Reunion.findByPk(id)
            if (!reunion) return res.status(404).send('Reunión no encontrada')

            // Verificar permisos: solo el vendedor dueño o admin
            if (req.auth.rol === 'vendedor' && reunion.vendedorId !== req.auth.id) {
                return res.status(403).send('No puedes editar reuniones de otros vendedores')
            }

            const reunionActualizada = await reunion.update({
                titulo,
                descripcion,
                fecha,
                hora,
                duracion: parseInt(duracion),
                estado
            })

            console.log('Reunión actualizada exitosamente', reunionActualizada)

            const msg = encodeURIComponent('Reunión actualizada exitosamente')
            res.redirect(`/reuniones/gestionar?success=${msg}`)
        } catch (error) {
            next(error)
        }
    }
]

// DELETE /reuniones/:id - Eliminar reunión
exports.delete = [
    requireAuth,
    requireRole('vendedor', 'admin'),
    async (req, res, next) => {
        try {
            const { id } = req.params
            const reunion = await Reunion.findByPk(id)

            if (!reunion) return res.status(404).send('Reunión no encontrada')

            // Verificar permisos: solo el vendedor dueño o admin
            if (req.auth.rol === 'vendedor' && reunion.vendedorId !== req.auth.id) {
                return res.status(403).send('No puedes eliminar reuniones de otros vendedores')
            }

            await reunion.destroy()

            console.log('Reunión eliminada exitosamente')

            const msg = encodeURIComponent('Reunión eliminada exitosamente')
            res.redirect(`/reuniones/gestionar?success=${msg}`)
        } catch (error) {
            next(error)
        }
    }
]

// GET /reuniones/mis-inscripciones - Ver mis reuniones agendadas
exports.misInscripciones = [
    requireAuth,
    async (req, res, next) => {
        try {
            const usuario = await Usuario.findByPk(req.auth.id, {
                include: [{
                    model: Reunion,
                    as: 'reunionesAsistidas',
                    where: {
                        estado: {
                            [Op.in]: ['programada', 'en_curso']
                        }
                    },
                    through: {
                        where: {
                            estado: {
                                [Op.in]: ['inscrito', 'confirmado']
                            }
                        }
                    },
                    include: [{
                        model: Usuario,
                        as: 'vendedor',
                        attributes: ['nombre', 'email']
                    }],
                    required: false
                }],
                order: [[{ model: Reunion, as: 'reunionesAsistidas' }, 'fecha', 'ASC']]
            })

            const reuniones = usuario.reunionesAsistidas ? usuario.reunionesAsistidas.map(r => r.get({ plain: true })) : []

            res.render('reuniones/mis-inscripciones', { reuniones })
        } catch (error) {
            next(error)
        }
    }
]

// GET /reuniones/historial - Ver historial de reuniones
exports.historial = [
    requireAuth,
    async (req, res, next) => {
        try {
            const usuario = await Usuario.findByPk(req.auth.id, {
                include: [{
                    model: Reunion,
                    as: 'reunionesAsistidas',
                    where: {
                        estado: {
                            [Op.in]: ['finalizada', 'cancelada']
                        }
                    },
                    through: {
                        where: {
                            estado: {
                                [Op.notIn]: ['cancelado']
                            }
                        }
                    },
                    include: [{
                        model: Usuario,
                        as: 'vendedor',
                        attributes: ['nombre', 'email']
                    }],
                    required: false
                }],
                order: [[{ model: Reunion, as: 'reunionesAsistidas' }, 'fecha', 'DESC']]
            })

            const reuniones = usuario.reunionesAsistidas ? usuario.reunionesAsistidas.map(r => r.get({ plain: true })) : []

            res.render('reuniones/historial', { reuniones })
        } catch (error) {
            next(error)
        }
    }
]

// GET /reuniones/gestionar - Gestionar mis reuniones
exports.gestionar = [
    requireAuth,
    requireRole('vendedor', 'admin'),
    async (req, res, next) => {
        try {
            const { success } = req.query
            let reuniones

            if (req.auth.rol === 'vendedor') {
                reuniones = await Reunion.findAll({
                    where: { vendedorId: req.auth.id },
                    order: [['fecha', 'ASC']],
                    raw: true
                })
            } else if (req.auth.rol === 'admin') {
                reuniones = await Reunion.findAll({
                    include: [{
                        model: Usuario,
                        as: 'vendedor',
                        attributes: ['nombre']
                    }],
                    order: [['fecha', 'ASC']],
                    raw: true,
                    nest: true
                })
            }

            res.render('reuniones/gestionar', { reuniones, success })
        } catch (error) {
            next(error)
        }
    }
]

// POST /reuniones/:id/inscribirse - Agendar reunión
exports.inscribirse = [
    requireAuth,
    async (req, res, next) => {
        try {
            const { id } = req.params

            if (req.auth.rol !== 'cliente') {
                return res.status(403).send('Solo los clientes pueden agendar reuniones')
            }

            const reunion = await Reunion.findByPk(id)
            if (!reunion) return res.status(404).send('Reunión no encontrada')

            const tieneCliente = await UsuarioReunion.findOne({
                where: {
                    reunionId: id,
                    estado: {
                        [Op.in]: ['inscrito', 'confirmado']
                    }
                }
            })

            if (tieneCliente) {
                const msg = encodeURIComponent('Esta reunión ya fue agendada')
                return res.redirect(`/reuniones/${id}?error=${msg}`)
            }

            const inscripcionExistente = await UsuarioReunion.findOne({
                where: {
                    usuarioId: req.auth.id,
                    reunionId: id
                }
            })

            if (inscripcionExistente) {
                await inscripcionExistente.update({
                    estado: 'inscrito',
                    fechaInscripcion: new Date()
                })
            } else {
                await UsuarioReunion.create({
                    usuarioId: req.auth.id,
                    reunionId: id,
                    estado: 'inscrito',
                    fechaInscripcion: new Date()
                })
            }

            console.log('Reunión agendada exitosamente')

            const msg = encodeURIComponent('Reunión agendada exitosamente')
            res.redirect(`/reuniones/mis-inscripciones?success=${msg}`)
        } catch (error) {
            next(error)
        }
    }
]

// POST /reuniones/:id/cancelar - Cancelar reunión
exports.cancelarInscripcion = [
    requireAuth,
    async (req, res, next) => {
        try {
            const { id } = req.params

            const inscripcion = await UsuarioReunion.findOne({
                where: {
                    usuarioId: req.auth.id,
                    reunionId: id,
                    estado: {
                        [Op.in]: ['inscrito', 'confirmado']
                    }
                }
            })

            if (!inscripcion) return res.status(404).send('No tienes esta reunión agendada')

            await inscripcion.update({ estado: 'cancelado' })

            console.log('Reunión cancelada exitosamente')

            const msg = encodeURIComponent('Reunión cancelada exitosamente')
            res.redirect(`/reuniones/mis-inscripciones?success=${msg}`)
        } catch (error) {
            next(error)
        }
    }
]

// GET /reuniones/:id/participantes - Ver cliente de la reunión
exports.participantes = [
    requireAuth,
    requireRole('vendedor', 'admin'),
    async (req, res, next) => {
        try {
            const { id } = req.params

            const reunion = await Reunion.findByPk(id, {
                include: [{
                    model: Usuario,
                    as: 'participantes',
                    through: {
                        where: {
                            estado: {
                                [Op.in]: ['inscrito', 'confirmado']
                            }
                        },
                        required: false
                    },
                    attributes: ['id', 'nombre', 'email']
                }]
            })

            if (!reunion) return res.status(404).send('Reunión no encontrada')

            if (req.auth.rol === 'vendedor' && reunion.vendedorId !== req.auth.id) {
                return res.status(403).send('No puedes ver participantes de reuniones de otros vendedores')
            }

            const reunionPlana = reunion.get({ plain: true })
            const cliente = reunionPlana.participantes && reunionPlana.participantes.length > 0
                ? reunionPlana.participantes[0]
                : null

            res.render('reuniones/participantes', { reunion: reunionPlana, cliente })
        } catch (error) {
            next(error)
        }
    }
]
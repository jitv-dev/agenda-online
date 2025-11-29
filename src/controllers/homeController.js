const { Usuario, Reunion, UsuarioReunion } = require('../models/associations')
const { Op } = require('sequelize')

exports.index = (req, res, next) => {
    try {
        res.render('home/index')
    } catch (error) {
        next(error)
    }
}

exports.dashboard = async (req, res, next) => {
    try {
        const { success } = req.query
        const usuarioId = req.auth.id
        const rol = req.auth.rol

        let estadisticas = {}

        if (rol === 'cliente') {
            // Estadisticas para cliente
            const totalReuniones = await UsuarioReunion.count({
                where: {
                    usuarioId,
                    estado: {
                        [Op.in]: ['inscrito', 'confirmado']
                    }
                }
            })

            // Contar reuniones proximas usando subconsulta
            const usuario = await Usuario.findByPk(usuarioId, {
                include: [{
                    model: Reunion,
                    as: 'reunionesAsistidas',
                    where: {
                        fecha: { [Op.gte]: new Date() },
                        estado: 'programada'
                    },
                    through: {
                        where: { estado: 'inscrito' }
                    },
                    required: false
                }]
            })

            const reunionesProximas = usuario.reunionesAsistidas ? usuario.reunionesAsistidas.length : 0

            estadisticas = {
                totalReuniones,
                reunionesProximas
            }

        } else if (rol === 'vendedor') {
            // Estadisticas para vendedor
            const totalReuniones = await Reunion.count({
                where: { vendedorId: usuarioId }
            })

            const reunionesProgramadas = await Reunion.count({
                where: {
                    vendedorId: usuarioId,
                    estado: 'programada',
                    fecha: { [Op.gte]: new Date() }
                }
            })

            const reunionesFinalizadas = await Reunion.count({
                where: {
                    vendedorId: usuarioId,
                    estado: 'finalizada'
                }
            })

            // Contar reuniones con cliente de forma diferente
            const reunionesDelVendedor = await Reunion.findAll({
                where: { vendedorId: usuarioId },
                include: [{
                    model: Usuario,
                    as: 'participantes',
                    through: {
                        where: {
                            estado: {
                                [Op.in]: ['inscrito', 'confirmado']
                            }
                        }
                    },
                    required: true
                }],
                attributes: ['id']
            })

            const reunionesConCliente = reunionesDelVendedor.length

            // Proximas reuniones con detalle
            const proximasReuniones = await Reunion.findAll({
                where: {
                    vendedorId: usuarioId,
                    estado: 'programada',
                    fecha: { [Op.gte]: new Date() }
                },
                include: [{
                    model: Usuario,
                    as: 'participantes',
                    through: {
                        where: {
                            estado: {
                                [Op.in]: ['inscrito', 'confirmado']
                            }
                        }
                    },
                    required: false,
                    attributes: ['nombre']
                }],
                order: [['fecha', 'ASC'], ['hora', 'ASC']],
                limit: 5
            })

            estadisticas = {
                totalReuniones,
                reunionesProgramadas,
                reunionesFinalizadas,
                reunionesConCliente,
                proximasReuniones: proximasReuniones.map(r => r.get({ plain: true }))
            }

        } else if (rol === 'admin') {
            // Estadisticas para admin
            const totalReuniones = await Reunion.count()

            const reunionesProgramadas = await Reunion.count({
                where: {
                    estado: 'programada',
                    fecha: { [Op.gte]: new Date() }
                }
            })

            const reunionesFinalizadas = await Reunion.count({
                where: { estado: 'finalizada' }
            })

            const totalVendedores = await Usuario.count({
                where: { rol: 'vendedor' }
            })

            const totalClientes = await Usuario.count({
                where: { rol: 'cliente' }
            })

            // Contar reuniones con cliente
            const todasLasReuniones = await Reunion.findAll({
                include: [{
                    model: Usuario,
                    as: 'participantes',
                    through: {
                        where: {
                            estado: {
                                [Op.in]: ['inscrito', 'confirmado']
                            }
                        }
                    },
                    required: true
                }],
                attributes: ['id']
            })

            const reunionesConCliente = todasLasReuniones.length

            // Proximas reuniones
            const proximasReuniones = await Reunion.findAll({
                where: {
                    estado: 'programada',
                    fecha: { [Op.gte]: new Date() }
                },
                include: [
                    {
                        model: Usuario,
                        as: 'vendedor',
                        attributes: ['nombre']
                    },
                    {
                        model: Usuario,
                        as: 'participantes',
                        through: {
                            where: {
                                estado: {
                                    [Op.in]: ['inscrito', 'confirmado']
                                }
                            }
                        },
                        required: false,
                        attributes: ['nombre']
                    }
                ],
                order: [['fecha', 'ASC'], ['hora', 'ASC']],
                limit: 5
            })

            estadisticas = {
                totalReuniones,
                reunionesProgramadas,
                reunionesFinalizadas,
                totalVendedores,
                totalClientes,
                reunionesConCliente,
                proximasReuniones: proximasReuniones.map(r => r.get({ plain: true }))
            }
        }

        res.render('home/dashboard', { success, estadisticas })
    } catch (error) {
        next(error)
    }
}
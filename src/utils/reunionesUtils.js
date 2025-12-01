const { Reunion, UsuarioReunion } = require('../models/associations');
const { Op } = require('sequelize');

async function actualizarReunionesVencidas() {
    try {
        const ahora = new Date();

        // Buscar reuniones programadas Y en curso
        const reuniones = await Reunion.findAll({
            where: {
                estado: {
                    [Op.in]: ['programada', 'en_curso']
                }
            }
        })

        let numFinalizadas = 0
        let numEnCurso = 0
        let numCanceladas = 0

        for (const reunion of reuniones) {
            // reunion.fecha es string "YYYY-MM-DD" con DATEONLY
            const fechaStr = reunion.fecha
            const horaStr = reunion.hora
            const duracion = reunion.duracion || 60

            // Crear timestamp completo (se interpreta en zona horaria del servidor)
            const fechaHoraStr = `${fechaStr}T${horaStr}`
            const fechaInicio = new Date(fechaHoraStr)

            // Calcular fecha de fin
            const fechaFin = new Date(fechaInicio.getTime() + duracion * 60000)

            // Verificar si tiene cliente asignado
            const tieneCliente = await UsuarioReunion.findOne({
                where: {
                    reunionId: reunion.id,
                    estado: {
                        [Op.in]: ['inscrito', 'confirmado']
                    }
                }
            })

            // LÓGICA DE ACTUALIZACIÓN

            // 1. Si ya pasó la hora de fin
            if (ahora > fechaFin) {
                // Tiene cliente y finalizó = FINALIZADA
                // No tiene cliente y finalizó = CANCELADA
                const nuevoEstado = tieneCliente ? 'finalizada' : 'cancelada'

                if (reunion.estado !== nuevoEstado) {
                    await reunion.update({ estado: nuevoEstado })

                    if (tieneCliente) {
                        numFinalizadas++
                        console.log(`Reunión ${reunion.id} finalizada (con cliente)`)
                    } else {
                        numCanceladas++
                        console.log(`Reunión ${reunion.id} cancelada (sin cliente, ya finalizó)`)
                    }
                }
            }
            // 2. Si es hora de iniciar/está en curso (entre inicio y fin)
            else if (ahora >= fechaInicio && ahora <= fechaFin) {
                if (tieneCliente) {
                    // Tiene cliente y empezó = EN CURSO
                    if (reunion.estado === 'programada') {
                        await reunion.update({ estado: 'en_curso' })
                        numEnCurso++
                        console.log(`Reunión ${reunion.id} iniciada (con cliente)`)
                    }
                } else {
                    // No tiene cliente y empezó = CANCELADA
                    if (reunion.estado === 'programada') {
                        await reunion.update({ estado: 'cancelada' })
                        numCanceladas++
                        console.log(`Reunión ${reunion.id} cancelada (sin cliente al iniciar)`)
                    }
                }
            }
            // 3. Si está en_curso pero perdió al cliente
            else if (reunion.estado === 'en_curso' && !tieneCliente) {
                await reunion.update({ estado: 'cancelada' })
                numCanceladas++
                console.log(`Reunión ${reunion.id} cancelada (perdió cliente durante reunión)`)
            }
        }

        if (numFinalizadas > 0) {
            console.log(`${numFinalizadas} reunión(es) finalizada(s) automáticamente`)
        }

        if (numEnCurso > 0) {
            console.log(`${numEnCurso} reunión(es) actualizada(s) a en_curso`)
        }

        if (numCanceladas > 0) {
            console.log(`${numCanceladas} reunión(es) cancelada(s) automáticamente`)
        }

        return {
            finalizadas: numFinalizadas,
            enCurso: numEnCurso,
            canceladas: numCanceladas
        };
    } catch (error) {
        console.error('Error actualizando reuniones vencidas:', error)
        return { finalizadas: 0, enCurso: 0, canceladas: 0 }
    }
}

module.exports = {
    actualizarReunionesVencidas
}
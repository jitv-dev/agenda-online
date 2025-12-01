const { Reunion, UsuarioReunion } = require('../models/associations');
const { Op } = require('sequelize');

async function actualizarReunionesVencidas() {
    try {
        const ahora = new Date()

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
            // reunion.fecha es string "YYYY-MM-DD"
            const [year, month, day] = reunion.fecha.split('-').map(Number)

            // Crear fecha local (no UTC)
            const fechaLocal = new Date(year, month - 1, day)

            const duracion = reunion.duracion || 60

            // Crear fecha de inicio de reunión
            const [hora, minutos] = reunion.hora.split(':').map(Number)
            const fechaInicioReunion = new Date(fechaLocal)
            fechaInicioReunion.setHours(hora, minutos, 0, 0)

            // Crear fecha de fin de reunión
            const fechaFinReunion = new Date(fechaInicioReunion)
            fechaFinReunion.setMinutes(fechaFinReunion.getMinutes() + duracion)

            // Verificar si esta reunión tiene cliente asignado
            const tieneCliente = await UsuarioReunion.findOne({
                where: {
                    reunionId: reunion.id,
                    estado: {
                        [Op.in]: ['inscrito', 'confirmado']
                    }
                }
            })

            // VERIFICACIÓN PARA TODAS LAS REUNIONES (programada o en_curso)

            // 1. Si ya pasó la hora de fin
            if (ahora > fechaFinReunion) {
                // Si tiene cliente: FINALIZADA
                // Si no tiene cliente: CANCELADA
                const nuevoEstado = tieneCliente ? 'finalizada' : 'cancelada'

                if (reunion.estado !== nuevoEstado) {
                    await reunion.update({ estado: nuevoEstado })

                    if (tieneCliente) {
                        numFinalizadas++
                        console.log(`Reunión ${reunion.id} finalizada automáticamente`)
                    } else {
                        numCanceladas++
                        console.log(`Reunión ${reunion.id} cancelada automáticamente por falta de cliente`)
                    }
                }
            }
            // 2. Verificar si es hora de iniciar la reunión (en curso) - SOLO SI TIENE CLIENTE
            else if (ahora >= fechaInicioReunion && ahora <= fechaFinReunion && tieneCliente) {
                // Solo cambiar a en_curso si actualmente está programada
                if (reunion.estado === 'programada') {
                    await reunion.update({ estado: 'en_curso' })
                    numEnCurso++
                    console.log(`Reunión ${reunion.id} iniciada automáticamente`)
                }
            }
            // 3. Si una reunión en_curso perdió al cliente durante la reunión
            else if (reunion.estado === 'en_curso' && !tieneCliente) {
                await reunion.update({ estado: 'cancelada' })
                numCanceladas++
                console.log(`Reunión ${reunion.id} cancelada durante su ejecución por pérdida de cliente`)
            }
        }

        if (numFinalizadas > 0) {
            console.log(`${numFinalizadas} reunión(es) con cliente actualizada(s) automáticamente a finalizada`)
        }

        if (numEnCurso > 0) {
            console.log(`${numEnCurso} reunión(es) actualizada(s) automáticamente a en_curso`)
        }

        if (numCanceladas > 0) {
            console.log(`${numCanceladas} reunión(es) cancelada(s) automáticamente`)
        }

        return {
            finalizadas: numFinalizadas,
            enCurso: numEnCurso,
            canceladas: numCanceladas
        }
    } catch (error) {
        console.error('Error actualizando reuniones vencidas:', error)
        return { finalizadas: 0, enCurso: 0, canceladas: 0 }
    }
}

module.exports = {
    actualizarReunionesVencidas
}
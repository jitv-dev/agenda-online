const sequelize = require('../config/db');
const Usuario = require('./Usuario');
const Reunion = require('./Reunion');
const UsuarioReunion = require('./UsuarioReunion');

// Relación 1:N - Un vendedor imparte muchas reuniones
Usuario.hasMany(Reunion, {
    foreignKey: 'vendedorId',
    as: 'reunionesImpartidas',
    onDelete: 'RESTRICT' // No permite borrar vendedor si tiene reuniones
});

Reunion.belongsTo(Usuario, {
    foreignKey: 'vendedorId',
    as: 'vendedor',
    onDelete: 'RESTRICT'
});

// Relación N:M - Muchos clientes pueden asistir a muchas reuniones
Usuario.belongsToMany(Reunion, {
    through: UsuarioReunion,
    foreignKey: 'usuarioId',
    otherKey: 'reunionId',
    as: 'reunionesAsistidas', // Para clientes
    onDelete: 'CASCADE'
});

Reunion.belongsToMany(Usuario, {
    through: UsuarioReunion,
    foreignKey: 'reunionId',
    otherKey: 'usuarioId',
    as: 'participantes', // Clientes en la reunión
    onDelete: 'CASCADE'
});

module.exports = {
    Usuario,
    Reunion,
    UsuarioReunion
}
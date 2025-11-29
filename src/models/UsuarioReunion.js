const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const UsuarioReunion = sequelize.define('usuario_reunion', {
    // Estado de la inscripción
    estado: {
        type: DataTypes.ENUM('inscrito', 'confirmado', 'cancelado'),
        defaultValue: 'inscrito'
    },
    // Fecha de inscripción
    fechaInscripcion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
}, {
    tableName: 'usuarios_reuniones',
    timestamps: true
});

module.exports = UsuarioReunion;
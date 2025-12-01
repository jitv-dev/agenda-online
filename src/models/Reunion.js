const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Reunion = sequelize.define('reunion', {
    titulo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    hora: {
        type: DataTypes.TIME,
        allowNull: false
    },
    duracion: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    // FK para el vendedor que imparte la reunión
    vendedorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'usuarios',
            key: 'id'
        }
    },
    estado: {
        type: DataTypes.ENUM('programada', 'en_curso', 'finalizada', 'cancelada'),
        defaultValue: 'programada'
    }
}, {
    tableName: 'reuniones',
    timestamps: true
});


module.exports = Reunion
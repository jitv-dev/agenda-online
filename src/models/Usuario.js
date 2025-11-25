const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Usuario = sequelize.define('usuario', {
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    rol: {
        type: DataTypes.ENUM('cliente', 'vendedor', 'admin'),
        allowNull: false,
        defaultValue: 'cliente'
    } 
},{ 
    tableName: 'usuarios',
    timestamps: true
})

module.exports = Usuario;
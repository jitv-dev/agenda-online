require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = process.env.DATABASE_URL
    // Si hay database url conecta en render aca
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    }) 
    // Si no hay conecto de forma local
    : new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            dialect: process.env.DB_DIALECT,
            logging: false
        }
    )

module.exports = sequelize


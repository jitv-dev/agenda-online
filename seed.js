const bcrypt = require('bcryptjs')
const { Usuario } = require('./src/models/associations')

async function seedDatabase() {
    try {
        console.log('Creando usuarios iniciales...')

        // CREAR ADMIN
        let admin = await Usuario.findOne({
            where: { email: 'admin@empresa.com' }
        })

        if (!admin) {
            const adminPassword = await bcrypt.hash('admin123', 10)
            admin = await Usuario.create({
                nombre: 'Administrador Principal',
                email: 'admin@empresa.com',
                password: adminPassword,
                rol: 'admin'
            });
            console.log('ADMIN creado:')
            console.log('Email: admin@empresa.com')
            console.log('Contraseña: admin123')
        } else {
            console.log('El ADMIN ya existe')
        }

        // CREAR VENDEDOR
        let vendedor = await Usuario.findOne({
            where: { email: 'vendedor@empresa.com' }
        });

        if (!vendedor) {
            const vendedorPassword = await bcrypt.hash('vendedor123', 10)
            vendedor = await Usuario.create({
                nombre: 'Vendedor Ejemplo',
                email: 'vendedor@empresa.com',
                password: vendedorPassword,
                rol: 'vendedor'
            });
            console.log('VENDEDOR creado:')
            console.log('Email: vendedor@empresa.com')
            console.log('Contraseña: vendedor123')
        } else {
            console.log('El VENDEDOR ya existe')
        }

        // CREAR CLIENTE
        let cliente = await Usuario.findOne({
            where: { email: 'cliente@empresa.com' }
        })

        if (!cliente) {
            const clientePassword = await bcrypt.hash('cliente123', 10)
            cliente = await Usuario.create({
                nombre: 'Cliente Demo',
                email: 'cliente@empresa.com',
                password: clientePassword,
                rol: 'cliente'
            });
            console.log('CLIENTE creado:')
            console.log('Email: cliente@empresa.com')
            console.log('Contraseña: cliente123')
        } else {
            console.log('El CLIENTE ya existe')
        }

    } catch (error) {
        console.error('Error creando usuario:', error)
    }
}

module.exports = seedDatabase
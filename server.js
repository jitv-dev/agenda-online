const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const PORT = process.env.PORT || 8080
const sequelize = require('./src/config/db')

const reunionesRouter = require('./src/routes/reuniones')
const homeRouter = require('./src/routes/home')
const authRouter = require('./src/routes/auth')

const app = express()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))
app.use(methodOverride('_method'))
app.use(cookieParser())

// Middleware de autenticacion
const { currentUser } = require('./src/middlewares/authMiddleware')
app.use(currentUser)

app.use((req, res, next) => {
    res.locals.usuario = req.auth || null
    next()
})

app.engine('handlebars', exphbs.engine({
    defaultLayout: 'main',
    partialsDir: path.join(__dirname, 'src', 'views', 'partials'),
    helpers: {
        eq: (a, b) => a === b,
        or: (a, b) => a || b,
        formatDate: (date) => {
            if (!date) return ''
            const d = new Date(date)
            return d.toLocaleDateString('es-CL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        },
        formatDateInput: (date) => {
            if (!date) return ''
            const d = new Date(date)
            const year = d.getFullYear()
            const month = String(d.getMonth() + 1).padStart(2, '0')
            const day = String(d.getDate()).padStart(2, '0')
            return `${year}-${month}-${day}`
        },
        capitalize: (str) => {
            if (!str) return ''
            return str.charAt(0).toUpperCase() + str.slice(1)
        },
        formatEstado: (estado) => {
            if (!estado) return ''
            return estado.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        }
    }
}))
app.set('view engine', 'handlebars')
app.set('views', path.join(__dirname, 'src', 'views'))

app.use("/reuniones", reunionesRouter)
app.use("/", homeRouter)
app.use("/auth", authRouter)

app.get("/", (req, res) => res.redirect("/home"))

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send("Algo malió sal...")
})

// force para crear las tablas, luego usar alter
// en produccion nunca deberia existir el alter o force
sequelize.sync({ alter: process.env.NODE_ENV !== "production" })
    .then(() => {
        console.log('Base de datos ha sido sincronizada')
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`)
        })
    })
    .catch(err => {
        console.error('Error al conectar con la base de datos: ', err)
    })
const { Usuario } = require('../models/associations')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

exports.registerForm = (req, res) => {
    res.render("auth/register")
}

exports.registerUser = async (req, res) => {
    try {
        const { nombre, email, password } = req.body

        if (!nombre || !email || !password) {
            return res.render('auth/register', {
                error: "Todos los campos son obligatorios",
                nombre,
                email
            })
        }

        const existeCorreo = await Usuario.findOne({ where: { email } })
        if (existeCorreo) {
            return res.render('auth/register', {
                error: "El correo ingresado ya está registrado",
                nombre,
                email
            })
        }

        const hash = await bcrypt.hash(password, 10)
        const usuario = await Usuario.create({
            nombre,
            email,
            password: hash,
            rol: 'cliente'
        })

        return res.redirect('/auth/login?success=Te has registrado exitosamente, ahora inicia tu sesión')
    } catch (error) {
        next(error)
    }
}

exports.loginForm = (req, res) => {
    const success = req.query.success || null
    const error = req.query.error || null
    const logout = req.query.logout || null
    res.render("auth/login", { success, error, logout })
}

exports.loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body
        const usuario = await Usuario.findOne({ where: { email } })

        if (!usuario) {
            return res.render('auth/login', { error: "Email o contraseña incorrecta" })
        }

        const ok = await bcrypt.compare(password, usuario.password)
        if (!ok) {
            return res.render('auth/login', { error: "Email o contraseña incorrecta" })
        }

        const token = jwt.sign(
            {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            },
            process.env.JWT_SECRET,
            { expiresIn: "2hr" }
        )

        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // Esto si tuviera ruta HTTPS deberia ser true
            sameSite: 'lax',
            maxAge: 2 * 60 * 60 * 1000
        })

        return res.redirect('/inicio?success=Bienvenido')
    } catch (error) {
        next(error)
    }
}

exports.logout = (req, res) => {
    res.clearCookie("token")
    return res.redirect('/auth/login?logout=Sesión cerrada')
}
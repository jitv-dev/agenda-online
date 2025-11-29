const { expressjwt: jwt } = require('express-jwt')

const currentUser = jwt({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"],
    credentialsRequired: false,
    getToken: (req) => {
        if (req.headers.authorization?.startsWith("Bearer ")) {
            return req.headers.authorization.split(" ")[1]
        }

        if (req.cookies?.token) {
            return req.cookies.token
        }

        return null
    }
})

function requireAuth(req, res, next) {
    if (!req.auth) return res.redirect('/auth/login?error=Debes iniciar sesión')
    next()
}

function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.auth || !roles.includes(req.auth.rol)) {
            return res.status(403).redirect('/reuniones?error=No tienes permisos para ver esta página')
        }
        next()
    }
}

module.exports = { currentUser, requireAuth, requireRole }
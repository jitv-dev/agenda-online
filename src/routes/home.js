const express = require('express');
const router = express.Router()
const homeController = require('../controllers/homeController')

// Pagina principal al acceder
router.get('/home', homeController.index)

// Pagina que se ve al logearse
router.get('/dashboard', homeController.dashboard)

module.exports = router
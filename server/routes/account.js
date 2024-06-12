const express = require('express')

const AccountController = require('../controllers/account')
const router = express.Router()

// Signup route
router.post('/signup', AccountController.signup)

// Login route
router.post('/login', AccountController.login)

module.exports = router

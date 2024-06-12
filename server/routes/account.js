const express = require('express')

const AccountController = require('../controllers/account')
const router = express.Router()

// Signup route
router.post('/login', AccountController.login)
router.post('/signup', AccountController.signup)

module.exports = router

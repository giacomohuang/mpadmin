const express = require('express')
const authToken = require('../middlewares/authtoken')

const AccountController = require('../controllers/account')
const router = express.Router()

// Signup route
router.post('/login', AccountController.login)
router.post('/signup', AccountController.signup)
router.post('/hello', authToken, AccountController.hello)

module.exports = router

const Router = require('@koa/router')
const { authToken } = require('../middlewares/authtoken')
const { authSign } = require('../middlewares/authsign')
const AccountController = require('../controllers/account')
const router = new Router()

// Signup route
router.post('/account/login', authSign, AccountController.login)
router.post('/account/signup', AccountController.signup)
router.post('/account/verifytoken', authToken, AccountController.verifyToken)
router.post('/account/hello', authSign, authToken, AccountController.hello)
router.post('/account/generateTotp', authToken, AccountController.generateTotp)
router.post('/account/verifyTotp', authToken, AccountController.verifyTotp)

module.exports = router

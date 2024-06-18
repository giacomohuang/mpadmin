const Router = require('@koa/router')
const { authToken } = require('../middlewares/authtoken')
const { authSign } = require('../middlewares/authsign')
const AccountController = require('../controllers/account')
const router = new Router()

// Signup route
router.post('/account/login', authSign, AccountController.login)
router.post('/account/signup', AccountController.signup)
router.post('/account/verifytoken', AccountController.verifyToken)
router.post('/account/hello', authSign, authToken, AccountController.hello)
router.post('/account/generateTotp', AccountController.generateTotp)
router.post('/account/verifyTotp', AccountController.verifyTotp)

module.exports = router

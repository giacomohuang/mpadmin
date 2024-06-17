const Router = require('@koa/router')
const { authToken } = require('../middlewares/authtoken')
const AccountController = require('../controllers/account')
const router = new Router()

// Signup route
router.post('/account/login', AccountController.login)
router.post('/account/signup', AccountController.signup)
router.post('/account/verifytoken', AccountController.verifyToken)
router.post('/account/hello', authToken, AccountController.hello)

module.exports = router

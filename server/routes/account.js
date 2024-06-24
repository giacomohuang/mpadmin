const Router = require('@koa/router')
const { authToken } = require('../middlewares/authtoken')
const { authSign } = require('../middlewares/authsign')
const AccountController = require('../controllers/account')
const router = new Router()

// Account & My
router.post('/account/login', authSign, AccountController.login)
router.post('/account/signup', AccountController.signup)
router.post('/account/verifytoken', AccountController.verifyToken)
router.post('/account/hello', authSign, authToken, AccountController.hello)
router.post('/account/generateTotp', authToken, AccountController.generateTotp)
router.post('/account/verifyTotp', authToken, AccountController.verifyTotp)
router.post('/my/getauthinfo', authToken, AccountController.getAuthInfo)
router.post('/my/updatepassword', authToken, AccountController.updatePassword)
router.post('/my/updateemail', authToken, AccountController.updateEmail)
router.post('/my/updatephone', authToken, AccountController.updatePhone)

module.exports = router

const Router = require('@koa/router')
const { authToken } = require('../middlewares/authtoken')
const { authSign } = require('../middlewares/authsign')
const AccountController = require('../controllers/account')

const router = new Router()

// Account & My
const ts = [authSign, authToken]

router.post('/account/login', authSign, AccountController.login)
router.post('/account/signup', AccountController.signup)
router.post('/account/verifytoken', AccountController.verifyToken)
router.post('/account/hello', ...ts, AccountController.hello)
router.post('/account/generateTotp', ...ts, AccountController.generateTotp)
router.post('/account/verifyTotp', ...ts, AccountController.verifyTotp)
router.post('/my/getauthinfo', ...ts, AccountController.getAuthInfo)
router.post('/my/updatepassword', ...ts, AccountController.updatePassword)
router.post('/my/updateemail', ...ts, AccountController.updateEmail)
router.post('/my/updatephone', ...ts, AccountController.updatePhone)

module.exports = router

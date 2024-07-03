const Router = require('@koa/router')
const authToken = require('../middlewares/authtoken')
const authSign = require('../middlewares/authsign')
const AccountController = require('../controllers/account')

// const router = new Router({ prefix: '/api' });
const accountRouter = new Router()

// Account & My
const ts = [authSign, authToken]

accountRouter.post('/account/signup', authSign, AccountController.signup)
accountRouter.post('/account/signin', authSign, AccountController.signin)
accountRouter.post('/account/signout', authSign, AccountController.signout)
accountRouter.post('/account/verifytoken', ...ts, AccountController.verifyToken)
accountRouter.post('/account/generatetotpsecret', ...ts, AccountController.generateTotpSecret)
accountRouter.post('/account/verifytotp', ...ts, AccountController.verifyTotp)
accountRouter.post('/account/updatetotpsecret', ...ts, AccountController.updateTotpSecret)
accountRouter.get('/account/hello', AccountController.hello)

accountRouter.post('/my/getauthinfo', ...ts, AccountController.getAuthInfo)
accountRouter.post('/my/updatepassword', ...ts, AccountController.updatePassword)
accountRouter.post('/my/updateemail', ...ts, AccountController.updateEmail)
accountRouter.post('/my/updatephone', ...ts, AccountController.updatePhone)

module.exports = accountRouter

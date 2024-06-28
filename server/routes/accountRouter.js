import Router from '@koa/router'
import { authToken } from '../middlewares/authtoken.js'
import { authSign } from '../middlewares/authsign.js'
import AccountController from '../controllers/account.js'

// const router = new Router({ prefix: '/api' });
const accountRouter = new Router()

// Account & My
const ts = [authSign, authToken]

accountRouter.post('/account/signup', AccountController.signup)
accountRouter.post('/account/login', AccountController.login)
accountRouter.post('/account/verifytoken', ...ts, AccountController.verifyToken)
accountRouter.post('/account/generateTotp', ...ts, AccountController.generateTotp)
accountRouter.post('/account/verifyTotp', ...ts, AccountController.verifyTotp)
accountRouter.get('/account/hello', AccountController.hello)

accountRouter.post('/my/getauthinfo', ...ts, AccountController.getAuthInfo)
accountRouter.post('/my/updatepassword', ...ts, AccountController.updatePassword)
accountRouter.post('/my/updateemail', ...ts, AccountController.updateEmail)
accountRouter.post('/my/updatephone', ...ts, AccountController.updatePhone)

export default accountRouter

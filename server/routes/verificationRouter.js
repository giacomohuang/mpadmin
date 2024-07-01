import Router from '@koa/router'
import { authSign } from '../middlewares/authsign.js'
import VerificationController from '../controllers/verificaiton.js'

// const router = new Router({ prefix: '/api' });
const verificationRouter = new Router()

// Account & My
verificationRouter.post('/verification/sendemail', authSign, VerificationController.sendEmail)
verificationRouter.post('/verification/sendsms', authSign, VerificationController.sendSMS)

export default verificationRouter

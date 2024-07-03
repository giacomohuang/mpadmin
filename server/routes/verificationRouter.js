const Router = require('@koa/router')
const authSign = require('../middlewares/authsign')
const VerificationController = require('../controllers/verification')
// const router = new Router({ prefix: '/api' });
const verificationRouter = new Router()

// Account & My
verificationRouter.post('/verification/sendemail', authSign, VerificationController.sendEmail)
verificationRouter.post('/verification/sendsms', authSign, VerificationController.sendSMS)

module.exports = verificationRouter

import BaseController from './base.js'
import CustomError from '../CustomError.js'

class VerificationContoller extends BaseController {
  static async sendEmail(ctx) {
    try {
      const accountid = ctx.request.headers['accountid']
      if (!accountid) {
        throw new CustomError(401, 'Authenication Denied', 400111)
      }
      const length = 6
      const code = Math.floor(Math.random() * Math.pow(10, length))
        .toString()
        .padStart(length, '0')
      ctx.redis.set(`veriemail:${accountid}`, code, 'EX', 120)
    } catch (err) {
      console.log(err)
      if (!(err instanceof CustomError)) {
        throw new CustomError(500, 'Internal Server Error', 500000)
      }
    }
  }

  static async sendSMS(ctx) {}

  static getRandomDigits(length) {
    if (length > 10) length = 10
    return Math.floor(Math.random() * Math.pow(10, length))
      .toString()
      .padStart(length, '0')
  }
}

export default VerificationContoller

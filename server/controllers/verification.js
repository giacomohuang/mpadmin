const CustomError = require('../CustomError')

class VerificationController {
  static async sendEmail(ctx) {
    const accountid = ctx.request.headers['accountid']
    if (!accountid) {
      throw new CustomError(401, 'Authenication Denied', 400111)
    }
    const length = 10
    const code = VerificationController.getRandomDigits(length)
    ctx.body = code
    ctx.redis.set(`veriemail:${accountid}`, code, 'EX', 120)
    console.log(code)
  }
  static async sendSMS(ctx) {}

  static getRandomDigits(length) {
    if (length > 10) length = 10
    return Math.floor(Math.random() * Math.pow(10, length))
      .toString()
      .padStart(length, '0')
  }
}
module.exports = VerificationController

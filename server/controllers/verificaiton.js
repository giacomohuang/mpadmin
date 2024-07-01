import CustomError from '../CustomError.js'

class VerificationContoller {
  static async sendEmail(ctx) {
    const accountid = ctx.request.headers['accountid']
    if (!accountid) {
      throw new CustomError(401, 'Authenication Denied', 400111)
    }
    console.log()
    const length = 6
    const code = Math.floor(Math.random() * Math.pow(10, length))
      .toString()
      .padStart(length, '0')
    ctx.redis.set(`veriemail:${accountid}`, code, 'EX', 120)
  }

  static async sendSMS(ctx) {}
}

export default VerificationContoller

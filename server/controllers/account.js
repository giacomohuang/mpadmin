const BaseController = require('./base')
const Account = require('../models/account')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const speakeasy = require('speakeasy')
const CustomError = require('../CustomError')

class AccountController extends BaseController {
  static async signup(ctx) {
    try {
      const { accountname, password } = ctx.request.body
      const account = new Account({ accountname, password })

      await account.save()
      ctx.status = 201
      // ctx.body = { message: 'New user registered successfully' }
    } catch (err) {
      console.log(err)
      ctx.throw(400, 'Registration failed')
    }
  }

  static async login(ctx) {
    // console.log('*********')
    try {
      const { accountname, password } = ctx.request.body
      console.log(accountname, password)
      const account = await Account.findOne({ accountname, password })
      console.log(account)
      // console.log(account)
      if (!account) {
        throw new CustomError(400, 'Invalid accountname or password', '400001')
      }
      // Generate JWT token
      const accessToken = jwt.sign({ id: account._id, accountname: account.accountname }, process.env.SECRET_KEY_ACCESS, { expiresIn: '30s' })
      const refreshToken = jwt.sign({ id: account._id, accountname: account.accountname }, process.env.SECRET_KEY_REFRESH, { expiresIn: '30d' })
      const md5Token = crypto
        .createHash('md5')
        .update(refreshToken + process.env.SECRET_KEY_REFRESH)
        .digest('hex')

      await ctx.redis.set(md5Token, 'true')
      ctx.body = { accessToken, refreshToken }
      console.log('====login====')
      console.log('refreshToken:', refreshToken)
      console.log('md5:', md5Token)
    } catch (err) {
      throw err
    }
  }
  static async verifyToken(ctx) {
    ctx.status = 200
    ctx.body = { verify: true }
    // const { accessToken, refreshToken } = ctx.request.body
    // try {
    //   jwt.verify(accessToken, process.env.SECRET_KEY_ACCESS)
    //   ctx.status = 200
    //   ctx.body = { verify: true }
    // } catch (err) {
    //   if (err.name === 'TokenExpiredError') {
    //     try {
    //       console.log('refreshToken', refreshToken)
    //       jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESH)
    //       const resp = await refresh(refreshToken, ctx)
    //       const newAccessToken = resp.accessToken
    //       const newRefreshToken = resp.refreshToken
    //       ctx.status = 200
    //       ctx.body = { verify: true, newAccessToken, newRefreshToken }
    //     } catch (err) {
    //       console.log('error here', err)
    //       ctx.throw(401, 'Auth Failed 20001')
    //     }
    //   } else {
    //     console.log(err.name)
    //     ctx.throw(401, 'Auth Failed 20000')
    //   }
    // }
  }

  // 生成动态令牌的secret和激活地址
  static async generateTotp(ctx) {
    const { accountname } = ctx.request.body
    const secret = speakeasy.generateSecret({
      length: 20
    })
    const url = speakeasy.otpauthURL({ secret: secret.ascii, label: accountname, issuer: 'MPAdmin' })
    ctx.body = { ...ctx.body, url, secret: secret.base32 }
    // console.log(url, secret)
  }

  // 验证动态令牌，仅用于初始化
  static async verifyTotp(ctx) {
    const { secret, token } = ctx.request.body
    // console.log(secret, token)
    var tokenValidates = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token
    })
    ctx.body = { result: tokenValidates }
  }

  static async getAuthInfo(ctx) {
    try {
      const accountid = ctx.request.headers['accountid']
      console.log('accountId:', accountid)
      const authInfo = await Account.findOne({ _id: accountid }).select('areacode phone email totpSecret')
      // 如果有totp秘钥，则置为*，不暴露给客户端
      console.log(authInfo)
      if (authInfo.totpSecret) {
        authInfo.totpSecret = '*'
      }
      ctx.body = authInfo
    } catch (err) {
      console.log(err)
      ctx.status = 500
      ctx.body = { message: 'Internal Server Error' }
    }
  }

  // 验证并更新邮箱
  static async updateEmail(ctx) {
    try {
      const accountid = ctx.request.headers['accountid']
      const { verifycode, email } = ctx.request.body
      // TODO 验证verifycode
      const result = await Account.findOneAndUpdate({ _id: accountid }, { email })
      console.log(result)
      ctx.body = { result: true }
    } catch (err) {
      ctx.status = 500
      ctx.body = { message: 'Internal Server Error' }
    }
  }

  // 验证并更新邮箱
  static async updatePassword(ctx) {
    try {
      const accountid = ctx.request.headers['accountid']
      const { oldPassword, newPassword } = ctx.request.body
      // TODO 验证verifycode
      const result = await Account.findOneAndUpdate({ _id: accountid, password: oldPassword }, { password: newPassword })
      if (result) {
        ctx.body = { result: true }
      } else {
        ctx.body = { result: false }
      }
    } catch (err) {
      ctx.status = 500
      ctx.body = { message: 'Internal Server Error' }
    }
  }

  // 验证并更新手机号
  static async updatePhone(ctx) {
    try {
      const accountid = ctx.request.headers['accountid']
      const { verifycode, areacode, phone } = ctx.request.body
      // TODO 验证verifycode
      await Account.findOneAndUpdate({ _id: accountid }, { areacode, phone })
      ctx.body = { result: true }
    } catch (err) {
      ctx.status = 500
      ctx.body = { message: 'Internal Server Error' }
    }
  }

  static async hello(ctx) {
    // console.log('hello')
    // aaa = sss
    ctx.body = { data: 'hello' }
  }
}
module.exports = AccountController

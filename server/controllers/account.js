const BaseController = require('./base')
const Account = require('../models/account')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const speakeasy = require('speakeasy')
const CustomError = require('../CustomError')
const OpenAIService = require('../services/openai')
const { PassThrough } = require('stream')

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

  static async signin(ctx) {
    // console.log('*********')
    try {
      const { accountname, password } = ctx.request.body
      console.log(accountname, password)
      const cryptoPwd = crypto.createHmac('sha256', process.env.PWD_KEY).update(password).digest('hex')
      console.log(cryptoPwd)
      const account = await Account.findOne({ accountname, password: cryptoPwd })
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

      await ctx.redis.set(`auth:${md5Token}`, 't')
      ctx.body = { accessToken, refreshToken }
      console.log('====signin====')
      console.log('refreshToken:', refreshToken)
      console.log('md5:', md5Token)
    } catch (err) {
      throw err
    }
  }

  static async signout(ctx) {
    const refreshToken = ctx.request.headers['refreshtoken']
    console.log(refreshToken)
    const md5Token = crypto
      .createHash('md5')
      .update(refreshToken + process.env.SECRET_KEY_REFRESH)
      .digest('hex')
    console.log(md5Token)
    await ctx.redis.del(`auth:${md5Token}`)
    ctx.body = { result: true }
    //TODO：signout log
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
  static async generateTotpSecret(ctx) {
    const { accountname } = ctx.request.body
    console.log('accountname', accountname)
    const secret = speakeasy.generateSecret({
      length: 20
    })
    const url = speakeasy.otpauthURL({ secret: secret.ascii, label: accountname, issuer: 'MPAdmin' })
    ctx.body = { url, secret: secret.base32 }
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
      const authInfo = await Account.findOne({ _id: accountid }).select('areacode phone email totpSecret enable2FA')
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
      const cryptoOldPwd = crypto.createHmac('sha256', process.env.PWD_KEY).update(oldPassword).digest('hex')
      const cryptoNewPwd = crypto.createHmac('sha256', process.env.PWD_KEY).update(newPassword).digest('hex')
      const result = await Account.findOneAndUpdate({ _id: accountid, password: cryptoOldPwd }, { password: cryptoNewPwd })
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

  // 更新动态口令秘钥
  static async updateTotpSecret(ctx) {
    try {
      const accountid = ctx.request.headers['accountid']
      const { totpSecret } = ctx.request.body
      await Account.findOneAndUpdate({ _id: accountid }, { totpSecret })
      ctx.body = { result: true }
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
      //
      //

      await Account.findOneAndUpdate({ _id: accountid }, { areacode, phone })
      ctx.body = { result: true }
    } catch (err) {
      ctx.status = 500
      ctx.body = { message: 'Internal Server Error' }
    }
  }

  // 开启/关闭两步验证
  static async update2FA(ctx) {
    try {
      const accountid = ctx.request.headers['accountid']
      const { enable2FA } = ctx.request.body
      // TODO 验证verifycode
      const result = await Account.findOneAndUpdate({ _id: accountid }, { enable2FA })
      console.log(result)
      ctx.body = { result: true }
    } catch (err) {
      ctx.status = 500
      ctx.body = { message: 'Internal Server Error' }
    }
  }

  static async hello(ctx) {
    ctx.set({
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache',
      'Content-Type': 'text/event-stream' // 表示返回数据是个 stream
    })
    const stream = new PassThrough()
    ctx.status = 200
    ctx.body = stream
    OpenAIService.sendMessage(stream)
    console.log('finish')
    ctx.req.on('close', () => {
      console.log('client closed')
    })
  }
}

module.exports = AccountController

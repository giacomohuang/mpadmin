const BaseController = require('./base')
const Account = require('../models/account')
const jwt = require('jsonwebtoken')
const Redis = require('ioredis')
const crypto = require('crypto')
const { refresh } = require('../middlewares/authtoken')
const speakeasy = require('speakeasy')

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
      const account = await Account.findOne({ accountname })

      if (!account) {
        ctx.throw(401)
      }
      if (account.password !== password) {
        ctx.throw(401)
      }
      // Generate JWT token
      const accessToken = jwt.sign({ id: account._id, accountname: account.accountname }, process.env.SECRET_KEY_ACCESS, { expiresIn: '30s' })
      const refreshToken = jwt.sign({ id: account._id, accountname: account.accountname }, process.env.SECRET_KEY_REFRESH, { expiresIn: '30d' })
      const md5Token = crypto
        .createHash('md5')
        .update(refreshToken + process.env.SECRET_KEY_REFRESH)
        .digest('hex')

      const redis = new Redis()
      await redis.set(md5Token, 'true')
      ctx.body = { accessToken, refreshToken }
      console.log('====login====')
      console.log('refreshToken:', refreshToken)
      console.log('md5:', md5Token)
    } catch (err) {
      if (err.status == 401) {
        ctx.throw(401, 'Invalid accountname or password')
      } else {
        ctx.throw(500, 'Internal Server Error')
      }
    }
  }
  static async verifyToken(ctx) {
    const { accessToken, refreshToken } = ctx.request.body
    try {
      jwt.verify(accessToken, process.env.SECRET_KEY_ACCESS)
      ctx.status = 200
      ctx.body = { verify: true, needRefresh: false }
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        try {
          console.log('refreshToken', refreshToken)
          jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESH)
          const r = await refresh(refreshToken)
          console.log('reerer', r)
          const newAccessToken = r.accessToken
          const newRefreshToken = r.refreshToken
          ctx.status = 200
          ctx.body = { verify: true, needRefresh: true, newAccessToken, newRefreshToken }
        } catch (err) {
          ctx.throw(401, 'Auth Failed 20001')
        }
      } else {
        console.log(err.name)
        ctx.throw(401, 'Auth Failed 20000')
      }
    }
  }

  static async generateTotp(ctx) {
    const { accountname } = ctx.request.body
    const secret = speakeasy.generateSecret({
      length: 20
    })
    const url = speakeasy.otpauthURL({ secret: secret.ascii, label: accountname, issuer: 'MPAdmin' })
    ctx.body = { ...ctx.body, url, secret: secret.base32 }
    // console.log(url, secret)
  }

  static async verifyTotp(ctx) {
    const { secret, token } = ctx.request.body
    console.log(secret, token)
    var tokenValidates = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token
    })
    ctx.body = { result: tokenValidates }
  }
  static async hello(ctx) {
    try {
      // const t = req.headers['stoken']
      // const token = t.replace(/^bearer\s+/i, '')
      // const md5token = crypto.createHash('md5').update(token).digest('hex')
      // const redis = new Redis()
      // const result = await redis.get(md5token)
      // res.json(result)
      // console.log('res', req.user)
      ctx.body = { data: 'hello' }
      console.log('hahahahhahhaa', ctx.body)
    } catch (err) {
      console.log('err')
      ctx.throw(500, 'Internal Server Error')
    }
  }
}

module.exports = AccountController

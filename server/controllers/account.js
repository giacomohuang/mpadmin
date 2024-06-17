const BaseController = require('./base')
const Account = require('../models/account')
const jwt = require('jsonwebtoken')
const Redis = require('ioredis')
const crypto = require('crypto')
const { refresh } = require('../middlewares/authtoken')

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
      console.log(md5Token)
      const redis = new Redis()
      await redis.set(md5Token, true)
      ctx.body = { accessToken, refreshToken }
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
          const _newAccessToken = r.accessToken
          const _newRefreshToken = r.refreshToken
          ctx.status = 200
          ctx.body = { verify: true, needRefresh: true, _newAccessToken, _newRefreshToken }
        } catch (err) {
          ctx.throw(401, 'Auth Failed 20001')
        }
      } else {
        ctx.throw(401, 'Auth Failed 20000')
      }
    }
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
      ctx.body.data = 'asdasd'
      console.log('hahahahhahhaa', ctx.body)
    } catch (err) {
      console.log('err')
      ctx.throw(500, 'Internal Server Error')
    }
  }
}

module.exports = AccountController

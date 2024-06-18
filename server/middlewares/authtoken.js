const jwt = require('jsonwebtoken')
const Redis = require('ioredis')
const crypto = require('crypto')

const authToken = async (ctx, next) => {
  try {
    const t = ctx.request.headers['authorization']
    if (!t) {
      console.log('authToken', t)
      throw new Error('Access denied,code:40001')
    }
    const token = t.replace(/^bearer\s+/i, '')

    if (!token) {
      throw new Error('Access denied,code:40002')
    }

    try {
      // 如果accesstoken验证通过，放行
      if (!ctx.body) {
        ctx.body = {}
      }
      let decoded = jwt.verify(token, process.env.SECRET_KEY_ACCESS)
      console.log('access', decoded)
      await next()
    } catch (err) {
      // 如果是token过期
      if (err.name === 'TokenExpiredError') {
        // 开始验证refreshtoken
        const refresh = await refresh(ctx.request.headers['refreshtoken'])
        ctx.body.needRefresh = true
        ctx.body.newAccessToken = refresh.accessToken
        ctx.body.newRefreshToken = refresh.refreshToken
        await next()
      }
      // 如果accesstoken验证失败
      else {
        throw new Error('Access denied,code:40003')
      }
    }
  } catch (err) {
    ctx.throw(401, 'Access denied', err)
  }
}

const refresh = async (token) => {
  try {
    const refreshtoken_old = token
    const verify = jwt.verify(refreshtoken_old, process.env.SECRET_KEY_REFRESH)
    console.log('verify', verify)
    const { id, accountname } = verify
    const md5Token_old = crypto
      .createHash('md5')
      .update(refreshtoken_old + process.env.SECRET_KEY_REFRESH)
      .digest('hex')
    const redis = new Redis()
    const isExist = await redis.get(md5Token_old)
    // console.log('isExist redis key:', isExist)
    if (!isExist) {
      throw new Error('auth denied, code 40004')
    }
    redis.del(md5Token_old)
    console.log(id, accountname)
    const accessToken = jwt.sign({ id: id, accountname: accountname }, process.env.SECRET_KEY_ACCESS, { expiresIn: '30s' })
    const refreshToken = jwt.sign({ id: id, accountname: accountname }, process.env.SECRET_KEY_REFRESH, { expiresIn: '30d' })
    console.log('refreshToken', refreshToken)
    console.log('accesstoken', accessToken)
    const md5Token = crypto
      .createHash('md5')
      .update(refreshToken + process.env.SECRET_KEY_REFRESH)
      .digest('hex')
    console.log('md5', md5Token)
    await redis.set(md5Token, true)
    return { accessToken, refreshToken }
  } catch (err) {
    throw err
  }
}

module.exports = { authToken, refresh }

const jwt = require('jsonwebtoken')
const Redis = require('ioredis')
const crypto = require('crypto')

const authToken = async (ctx, next) => {
  try {
    const t = ctx.request.headers['authorization']
    if (!t) {
      // console.log('authToken', t)
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
      const decoded = jwt.verify(token, process.env.SECRET_KEY_ACCESS)
      ctx.request.headers['accountid'] = decoded.id
      // console.log('access', decoded)
      await next()
    } catch (err) {
      // 如果是token过期
      if (err.name === 'TokenExpiredError') {
        // 开始验证refreshtoken]
        console.log('start refresh token')
        const result = await refresh(ctx.request.headers['refreshtoken'])
        // console.log('res::::::::', result.accessToken, result.refreshToken)
        ctx.set('newAccessToken', result.accessToken)
        ctx.set('newRefreshToken', result.refreshToken)
        ctx.request.headers['accountid'] = result.id
        await next()
      }
      // 如果accesstoken验证失败
      else {
        throw new Error('Access denied,code:40003')``
      }
    }
  } catch (err) {
    console.log(err)
    ctx.throw(401, 'Access denied', err)
  }
}

const refresh = async (token) => {
  try {
    const refreshtoken_old = token
    const verify = jwt.verify(refreshtoken_old, process.env.SECRET_KEY_REFRESH)

    const { id, accountname } = verify
    const md5Token_old = crypto
      .createHash('md5')
      .update(refreshtoken_old + process.env.SECRET_KEY_REFRESH)
      .digest('hex')
    const redis = new Redis()
    // console.log('======refresh')
    // console.log('refreshToken:', token)
    // console.log('md5', md5Token_old)
    const isExist = await redis.get(md5Token_old)
    console.log('isExist redis key:', isExist, md5Token_old)
    if (!isExist) {
      throw new Error('auth denied, code 40004')
    }
    redis.del(md5Token_old)
    // console.log('-----', id, accountname)
    const accessToken = jwt.sign({ id: id, accountname: accountname }, process.env.SECRET_KEY_ACCESS, { expiresIn: '30s' })
    const refreshToken = jwt.sign({ id: id, accountname: accountname }, process.env.SECRET_KEY_REFRESH, { expiresIn: '30d' })
    // console.log('refreshToken', refreshToken)
    // console.log('accesstoken', accessToken)
    const md5Token = crypto
      .createHash('md5')
      .update(refreshToken + process.env.SECRET_KEY_REFRESH)
      .digest('hex')

    await redis.set(md5Token, 'true')
    console.log('!!!!!md5token:', md5Token)
    return { accessToken, refreshToken, id }
  } catch (err) {
    console.log('=======err in refresh====')
    throw err
  }
}

module.exports = { authToken, refresh }

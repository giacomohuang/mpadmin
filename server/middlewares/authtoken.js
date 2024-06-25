const jwt = require('jsonwebtoken')
const Redis = require('ioredis')
const crypto = require('crypto')
const CustomError = require('../CustomError')

const authToken = async (ctx, next) => {
  // console.log('=======ctx', ctx)
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
    console.log('access', decoded)
    await next()
  } catch (err) {
    // 如果是token过期
    if (err.name === 'TokenExpiredError') {
      // 开始验证refreshtoken
      try {
        const result = await refresh(ctx.request.headers['refreshtoken'])
        ctx.set({
          newaccesstoken: result.accessToken,
          newrefreshtoken: result.refreshToken
        })
        ctx.request.headers['accountid'] = result.id
        console.log('refreshed!!!!!!')
        console.log(ctx.response.headers)
        console.log('----------------------------')
        await next()
      } catch (err) {
        throw new Error('refresh failed 40006')
        // ctx.throw(401,new CustomError('refresh failed 40006'm40)
      }
    }
    // 如果accesstoken验证失败
    else {
      throw new CustomError('Access denied', 40003)
    }
  }
}

const refresh = async (token) => {
  try {
    console.log('!!!start refresh token!!!')
    const refreshtoken_old = token
    const verify = jwt.verify(refreshtoken_old, process.env.SECRET_KEY_REFRESH)
    console.log('!!!verify', verify)
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
      throw new CustomError('Access denied', 40004)
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
    console.log('!!!!!new md5token:', md5Token)
    return { accessToken, refreshToken, id }
  } catch (err) {
    console.log('=======err in refresh====')
    throw new CustomError('refresh failed', 40005)
  }
}

module.exports = { authToken, refresh }

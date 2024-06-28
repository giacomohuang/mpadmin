import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import CustomError from '../CustomError.js'

const authToken = async (ctx, next) => {
  console.log('authToken')
  let token = '',
    decoded,
    err
  let t = ctx.request.headers['authorization']
  if (t) {
    token = t.replace(/^bearer\s+/i, '')
  } else {
    throw new CustomError(401, 'Authentication Failed', 401001)
  }
  jwt.verify(token, process.env.SECRET_KEY_ACCESS, (error, d) => {
    decoded = d
    err = error
  })
  // 如果accesstoken验证通过，放行
  if (decoded) {
    ctx.request.headers['accountid'] = decoded.id
    await next()
  }
  // 如果是token过期
  // 开始验证refreshtoken
  else if (err.name === 'TokenExpiredError') {
    const result = await refresh(ctx.request.headers['refreshtoken'], ctx)
    ctx.set({
      newaccesstoken: result.accessToken,
      newrefreshtoken: result.refreshToken
    })
    ctx.request.headers['accountid'] = result.id
    console.log('token is refreshed!!!!!!')
    await next()
  }
  // 如果accesstoken内容验证失败
  else {
    throw new CustomError(401, 'Authentication Failed', 401002)
  }
}

const refresh = async (token, ctx) => {
  try {
    console.log('!!!start refreshing token!!!')
    const refreshtoken_old = token
    const verify = jwt.verify(refreshtoken_old, process.env.SECRET_KEY_REFRESH)
    const { id, accountname } = verify
    const md5Token_old = crypto
      .createHash('md5')
      .update(refreshtoken_old + process.env.SECRET_KEY_REFRESH)
      .digest('hex')

    const isExist = await ctx.redis.get(md5Token_old)
    if (!isExist) {
      throw new CustomError(401, 'Authentication Failed', 401011)
    }
    ctx.redis.del(md5Token_old)
    const accessToken = jwt.sign({ id: id, accountname: accountname }, process.env.SECRET_KEY_ACCESS, { expiresIn: '30s' })
    const refreshToken = jwt.sign({ id: id, accountname: accountname }, process.env.SECRET_KEY_REFRESH, { expiresIn: '30d' })
    const md5Token = crypto
      .createHash('md5')
      .update(refreshToken + process.env.SECRET_KEY_REFRESH)
      .digest('hex')

    await ctx.redis.set(md5Token, true)
    return { accessToken, refreshToken, id }
  } catch (err) {
    throw new CustomError(401, 'Authentication Failed', 401012)
  }
}

export { authToken }

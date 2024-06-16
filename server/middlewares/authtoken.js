const jwt = require('jsonwebtoken')
const Redis = require('ioredis')
const crypto = require('crypto')

function authToken(req, res, next) {
  const t = req.headers['authorization']
  if (!t) {
    return res.status(401).json({ message: 'Access denied,code:40000' })
  }
  const token = t.replace(/^bearer\s+/i, '')

  if (!token) {
    return res.status(401).json({ message: 'Access denied, code:40001' })
  }

  try {
    // 如果accesstoken验证通过，放行
    let decoded = jwt.verify(token, process.env.SECRET_KEY)
    req.user = decoded
  } catch (err) {
    // 如果是token过期
    if (err.name === 'TokenExpiredError') {
      // 开始验证refreshtoken
      let refreshtoken = req.headers['refreshtoken']
      // 如果header中不存在refreshtoken
      if (!rt) {
        return res.status(401).json({ message: 'Access denied, code:40006' })
      }

      try {
        decoded = jwt.verify(refreshtoken, process.env.SECRET_KEY)
        let md5token = crypto
          .createHash('md5')
          .update(refreshtoken + process.env.SECRET_KEY)
          .digest('hex')
        const redis = new Redis()
        const result = redis.get(md5token)
        if (result) {
          // 验证通过，放行
          // req.user = decoded
          // console.log('decoded', decoded)
          // console.log('decoded end')
          next()
        } else {
          // refreshtoken过期
          return res.status(401).json({ message: 'Access denied, code:40004' })
        }
      } catch {
        // refreshtoken 过期或者错误
        return res.status(401).json({ message: 'Access denied, code:40005' })
      }
      // return res.status(401).json({ message: 'Access denied, code:40002' })
    }
    // 如果accesstoken验证失败
    else {
      return res.status(401).json({ message: 'Access denied, code:40003' })
    }
  }

  // // 验证accesstoken
  // jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
  //   // 验证通过，放行
  //   if (!err) {
  //     req.user = decoded
  //     next()
  //   }
  //   // accesstoken过期
  //   if (err.name === 'TokenExpiredError') {
  //     console.log('heelosdfsdfshdjkfshdfjk08&&^%$$##%^&')
  //     console.log(decoded)
  //     // 验证refreshtoken
  //     const t = req.headers['refreshtoken']
  //     jwt.verify(t, process.env.SECRET_KEY, (err, decoded) => {
  //       let md5token = crypto.createHash('md5').update(token).digest('hex')
  //       const redis = new Redis()
  //       const result = redis.get(md5token)
  //       if (result) {
  //         // redis.del(md5token)
  //         // const accessToken = jwt.sign({ id: account._id, accountname: account.accountname }, process.env.SECRET_KEY, { expiresIn: '1h' })
  //         // const refreshToken = jwt.sign({ id: account._id, accountname: account.accountname }, process.env.SECRET_KEY, { expiresIn: '30d' })
  //         // md5Token = crypto.createHash('md5').update(refreshToken).digest('hex')
  //         // console.log(md5Token)
  //         // // const redis = new Redis()
  //         // redis.set(md5Token, 'true')
  //         // res.json({ accessToken, refreshToken })
  //       }
  //     })
  //   }
  //   // 验证失败
  //   else {
  //     return res.status(401).json({ message: 'Access denied, code:40002' })
  //   }
  // })
}

module.exports = authToken

import Redis from 'ioredis'
import crypto from 'crypto'

const authSign = async (ctx, next) => {
  // console.log('authSign')
  await next()
}

export { authSign }

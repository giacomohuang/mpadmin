const CustomError = require('../CustomError')

const errorHandler = async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    // ctx.respsonse.status = err.status || err.statusCode || 500
    // ctx.respsonse.body = {
    //   message: err.message,
    //   code: err.code
    // }
    console.log('$$$$$$$$$$errorHandler$$$$$$$')
    console.log(ctx.response)
    console.log(err.message)
  }
}
module.exports = { errorHandler }

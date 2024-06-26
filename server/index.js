const Koa = require('koa')
const { bodyParser } = require('@koa/bodyparser')
const accountRouter = require('./routes/account')
const mongoose = require('mongoose')
const cors = require('@koa/cors')
const { errorHandler } = require('./middlewares/errorHandler')
const Redis = require('ioredis')
// const logger = require('koa-logger')

// require('dotenv').config() //for using variables from .env file.

const app = new Koa()
const redis = new Redis()
const PORT = 3000

// app.use(logger())
app.use(bodyParser())
app.use(
  cors({
    origin: 'http://localhost:5173',
    maxAge: 3600,
    allowMethods: 'GET,POST',
    exposeHeaders: 'Authorization,Newaccesstoken,Newrefreshtoken,Refreshtoken'
  })
)
app.use(errorHandler)

// 将ioredis绑定到Koa的context上，以便在上下文中使用
app.context.redis = redis

mongoose.connect(process.env.MONGODB_URL).then(() => {
  console.log('MongoDB is connected!')
})

// console.log(accountRouter)
app.use(accountRouter.routes())
// app.use(accountRouter.allowedMethods())
// app.use(router.allowedMethods())

//Authentication route
// app.use(accountRouter.routes)
// app.use(accountRouter.allowedMethods())

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

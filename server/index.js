const Koa = require('koa')
const { bodyParser } = require('@koa/bodyparser')
const accountRouter = require('./routes/account')
const mongoose = require('mongoose')
const cors = require('@koa/cors')

// require('dotenv').config() //for using variables from .env file.

const app = new Koa()

const PORT = 3000

app.use(bodyParser())
app.use(
  cors({
    origin: 'http://localhost:5173',
    maxAge: 3600,
    allowMethods: 'GET,POST'
  })
)

mongoose.connect(process.env.MONGODB_URL).then(() => {
  console.log('MongoDB is connected!')
})

console.log(accountRouter)
app.use(accountRouter.routes())
// app.use(accountRouter.allowedMethods())
// app.use(router.allowedMethods())

//Authentication route
// app.use(accountRouter.routes)
// app.use(accountRouter.allowedMethods())

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

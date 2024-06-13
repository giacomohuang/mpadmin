const express = require('express')
const accountRouter = require('./routes/account')
const mongoose = require('mongoose')
const authToken = require('./middlewares/authtoken')
const cors = require('cors')

// require('dotenv').config() //for using variables from .env file.

const app = express()
const PORT = 3000

app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cors())

mongoose.connect(process.env.MONGODB_URL).then(() => {
  console.log('MongoDB is connected!')
})

//Authentication route
app.use('/account', accountRouter)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

const express = require('express')
const authRouter = require('./routes/auth')
const mongoose = require('mongoose')
const authToken = require('./middlewares/authtoken')

require('dotenv').config() //for using variables from .env file.

const app = express()
const PORT = 3000

console.log(process.env.MONGODB_URL)

mongoose.connect(process.env.MONGODB_URL).then(() => {
  console.log('MongoDB is connected!')
})
app.use(express.json())

//Authentication route
app.use('/auth', authRouter)

//decodeDetails Route
app.get('/decodeDetails', authToken, (req, res) => {
  const { username } = req.user
  res.json({ username })
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

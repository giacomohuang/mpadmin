const mongoose = require('mongoose')

const accountSchema = new mongoose.Schema({
  accountname: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  totpsecret: {
    type: String,
    required: true
  },
  phonenumber: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model('Account', accountSchema)

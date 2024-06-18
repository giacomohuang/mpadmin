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
  totp_secret: {
    type: String,
    required: true
  },
  phone_number: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model('Account', accountSchema)

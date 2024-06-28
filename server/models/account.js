import mongoose from 'mongoose'

const accountSchema = new mongoose.Schema({
  accountname: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    encrypted: true
  },
  areacode: {
    type: String,
    required: false
  },
  phone: {
    type: String,
    required: false
  },
  totpSecret: {
    type: String,
    required: false
  },
  email: {
    type: String,
    required: false
  }
})

export default mongoose.model('Account', accountSchema)

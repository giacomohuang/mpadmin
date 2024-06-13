const BaseController = require('./base')
const Account = require('../models/account')
const jwt = require('jsonwebtoken')

class AccountController extends BaseController {
  static async signup(req, res) {
    try {
      const { username, password } = req.body
      const account = new Account({ username, password })
      await account.save()
      res.status(201).json({ message: 'New user registered successfully' })
    } catch (err) {
      res.status(500).json({ err, message: 'Internal server error' })
    }
  }

  static async login(req, res) {
    try {
      const { username, password } = req.body
      const account = await Account.findOne({ username })

      if (!account) {
        return res.status(401).json({ message: 'Invalid username or password' })
      }
      if (account.password !== password) {
        return res.status(401).json({ message: 'Invalid username or password' })
      }
      // Generate JWT token
      const accessToken = jwt.sign({ id: account._id, username: account.username }, process.env.SECRET_KEY, { expiresIn: '1h' })
      const refreshToken = jwt.sign({ id: account._id, username: account.username }, process.env.SECRET_KEY, { expiresIn: '30d' })
      res.json({ accessToken, refreshToken })
    } catch (err) {
      res.status(500).json({ err, message: 'Internal server error' })
    }
  }
  static async refreshToken(req, res) {
    try {
      const accessToken = jwt.sign({ id: account._id, username: account.username }, process.env.SECRET_KEY, { expiresIn: '1h' })
      res.json({ accessToken })
    } catch (err) {
      res.status(500).json({ err, message: 'Internal server error' })
    }
  }
}

module.exports = AccountController

const BaseController = require('./base')
const Account = require('../models/account')
const jwt = require('jsonwebtoken')

class AccountController extends BaseController {
  static async signup(req, res) {
    try {
      const { accountname, password } = req.body
      const account = new Account({ accountname, password })
      await account.save()
      res.status(201).json({ message: 'New user registered successfully' })
    } catch (err) {
      res.status(500).json({ err, message: 'Internal server error' })
    }
  }

  static async login(req, res) {
    try {
      const { accountname, password } = req.body
      const account = await Account.findOne({ accountname })

      if (!account) {
        return res.status(401).json({ message: 'Invalid accountname or password' })
      }
      if (account.password !== password) {
        return res.status(401).json({ message: 'Invalid accountname or password' })
      }
      // Generate JWT token
      const accessToken = jwt.sign({ id: account._id, accountname: account.accountname }, process.env.SECRET_KEY, { expiresIn: '30s' })
      const refreshToken = jwt.sign({ id: account._id, accountname: account.accountname }, process.env.SECRET_KEY, { expiresIn: '30d' })
      res.json({ accessToken, refreshToken })
    } catch (err) {
      res.status(500).json({ err, message: 'Internal server error' })
    }
  }
  static async refreshToken(req, res) {
    try {
      const accessToken = jwt.sign({ id: account._id, accountname: account.accountname }, process.env.SECRET_KEY, { expiresIn: '1h' })
      res.json({ accessToken })
    } catch (err) {
      res.status(500).json({ err, message: 'Internal server error' })
    }
  }
  static async hello(req, res) {
    try {
      res.json({ hello: 'true' })
    } catch (err) {
      res.status(500).json({ err, message: 'Internal server error' })
    }
  }
}

module.exports = AccountController

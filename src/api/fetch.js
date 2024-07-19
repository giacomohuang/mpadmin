import axios from 'axios'
import baseUrl from './baseUrl'
import { router } from '../router/router'
import CryptoJS from 'crypto-js'
import { customAlphabet } from 'nanoid'
import helper from '../js/helper'

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10)

axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8'
axios.defaults.withCredentials = true // 允许携带cookie
let fetch = axios.create({
  baseURL: baseUrl.default,
  timeout: 10000,
  withCredentials: true
})

// 服务器请求拦截器
fetch.interceptors.request.use(
  (config) => {
    // console.log(config)
    const accesstoken = localStorage.getItem('accessToken')
    // console.log(accesstoken, refreshtoken)
    if (accesstoken) {
      config.headers['Authorization'] = 'Bearer ' + accesstoken
      config.headers['refreshtoken'] = localStorage.getItem('refreshToken')
    }
    const params = config.data ? config.data : {}
    const nonce = nanoid()
    const timestamp = Date.now()
    const sortedParams = JSON.stringify(helper.sortJSON(params)) + nonce + timestamp
    const cipher = CryptoJS.HmacSHA256(sortedParams, 'emDmpsE2Ad4wLLYwD66xjzY1eZhVHyEqSPrAxIcaC66xR9mkgzJJ9GswVyUyiWRb8MXfY9fKZlRuvEURySHMY8X6D5GqjMYKLUiIDs6Zq6uH9LJn4nArFje5SY0C1Yfk')
    const cipherText = CryptoJS.enc.Hex.stringify(cipher)
    // console.log(sortedParams, cipherText)
    config.headers['sign'] = cipherText
    config.headers['nonce'] = nonce
    config.headers['timestamp'] = timestamp
    return config
  },
  (err) => {
    console.log('network error')
    return Promise.reject(new Error(err))
  }
)

//服务器响应拦截器
fetch.interceptors.response.use(
  (response) => {
    // 如果header中携带refreshToken，更新本地存储
    storeRefreshToken(response)
    // console.log(response.headers)
    return response.data
  },
  (err) => {
    const { response } = err
    // console.log(response)
    if (!response) return Promise.reject({ status: 500, message: 'Internal Server Error' })
    // 如果header中携带refreshToken，更新本地存储
    storeRefreshToken(response)
    switch (response.status) {
      case 401:
        console.log(response)
        // console.log(err)
        router.push('/signin')
        break
      // return Promise.reject(response)
      case 500:
      default:
        console.log(response)
        // console.log('Internal Server Error, code:500')
        return Promise.reject(response)
    }
  }
)

function storeRefreshToken(resp) {
  if (!resp || !resp.headers) {
    return
  }
  if (resp.headers['newaccesstoken'] && resp.headers['newrefreshtoken']) {
    localStorage.setItem('accessToken', resp.headers['newaccesstoken'])
    localStorage.setItem('refreshToken', resp.headers['newrefreshtoken'])
    delete resp.headers['newaccesstoken']
    delete resp.headers['newrefreshtoken']
  }
}
export default fetch

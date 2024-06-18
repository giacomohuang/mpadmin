import axios from 'axios'
import baseUrl from './baseUrl'
import { router } from '../router/router'

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
    if (!['/account/login', '/account/verifytoken'].includes(config.url) && accesstoken) {
      config.headers['Authorization'] = 'Bearer ' + accesstoken
      config.headers['refreshtoken'] = localStorage.getItem('refreshToken')
    }
    return config
  },
  (err) => {
    console.log('network error')
    return Promise.reject(new Error(err))
  }
)

//服务器响应拦截器
fetch.interceptors.response.use(
  (resp) => {
    // if (router.currentRoute.value.meta.noAuth) return resp.data
    // console.log(resp.data)
    if (resp.data.needRefresh) {
      localStorage.setItem('accessToken', resp.data.newAccessToken)
      localStorage.setItem('refreshToken', resp.data.newRefreshToken)
      console.log('hit token refesh', resp.data.newAccessToken, resp.data.newRefreshToken)
      resp.data.newAccessToken = undefined
      resp.data.newRefreshToken = undefined
      resp.data.needRefresh = undefined
    }
    return resp.data
  },
  (err) => {
    const { response } = err
    console.log(err)
    switch (response.status) {
      case 401:
        console.log('Auth Denied, code:401')
        router.push('/login')
        return Promise.reject(response)
      case 500:
      default:
        console.log('Internal Server Error, code:500')
        return Promise.reject(response)
    }

    // if (response) {
    //   return Promise.reject(response)
    // } else if (!window.navigator.onLine) {
    //   return Promise.reject({ status: 500, message: 'Network is not connected' })
    // } else {
    //   return Promise.reject(err)
    // }
  }
)
export default fetch

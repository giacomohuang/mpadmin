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
    if (!['/account/login'].includes(config.url) && accesstoken) {
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
    // console.log('new', resp.headers['newaccesstoken'], resp.headers['newrefreshtoken'])
    if (resp.headers['newaccesstoken'] && resp.headers['newrefreshtoken']) {
      // console.log('hit token refresh')
      localStorage.setItem('accessToken', resp.headers['newaccesstoken'])
      localStorage.setItem('refreshToken', resp.headers['newrefreshtoken'])
      console.log('hit token refresh')
      // resp.data.newAccessToken = undefined
      resp.headers['newRefreshToken'] = undefined
      resp.headers['needRefresh'] = undefined
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
        console.log(err)
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

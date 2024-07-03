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
    if (!['/account/signin'].includes(config.url) && accesstoken) {
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
  (response) => {
    // 如果header中携带refreshToken，更新本地存储
    refreshToken(response)
    console.log(response.headers)
    return response.data
  },
  (err) => {
    const { response } = err
    // 如果header中携带refreshToken，更新本地存储
    refreshToken(response)
    switch (response.status) {
      case 401:
        console.log(response)
        console.log(err)
        router.push('/signin')
      // return Promise.reject(response)
      case 500:
      default:
        console.log(response)
        // console.log('Internal Server Error, code:500')
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

function refreshToken(resp) {
  if (resp.headers['newaccesstoken'] && resp.headers['newrefreshtoken']) {
    localStorage.setItem('accessToken', resp.headers['newaccesstoken'])
    localStorage.setItem('refreshToken', resp.headers['newrefreshtoken'])
    delete resp.headers['newaccesstoken']
    delete resp.headers['newrefreshtoken']
  }
}
export default fetch

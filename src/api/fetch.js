import axios from 'axios'
import baseUrl from './baseUrl'

axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8'
axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*'
axios.defaults.withCredentials = true // 允许携带cookie
let fetch = axios.create({
  baseURL: baseUrl.default,
  timeout: 10000,
  withCredentials: true
})

// 服务器请求拦截器
fetch.interceptors.request.use(
  (config) => {
    const accesstoken = localStorage.getItem('accesstoken')
    const refreshtoken = localStorage.getItem('refreshtoken')
    if (accesstoken) {
      config.headers['Authorization'] = 'Bearer ' + localStorage.getItem('accesstoken')
      config.headers['refreshtoken'] = localStorage.getItem('refreshtoken')
    }
    return config
  },
  (err) => {
    console.log('network error')
    return Promise.reject(err)
  }
)

//服务器响应拦截器
fetch.interceptors.response.use(
  (resp) => {
    return resp.data
  },
  (err) => {
    const { response } = err
    if (response) {
      return Promise.reject(response)
    } else if (!window.navigator.onLine) {
      return Promise.reject({ status: 500, message: 'Network is not connected' })
    } else {
      return Promise.reject(err)
    }
  }
)
export default fetch

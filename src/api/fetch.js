import axios from 'axios'

axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8'
axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*'
axios.defaults.withCredentials = true // 允许携带cookie

let fetch = axios.create({
  baseURL: 'http://127.0.0.1:3000',
  timeout: 10000,
  withCredentials: true
})

// 服务器请求拦截器
fetch.interceptors.request.use(
  (config) => {
    console.log('加载中')
    config.headers['Authorization'] = 'Bearer ' + localStorage.getItem('token')
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
    return resp
  },
  (err) => {
    const { response } = err
    if (response) {
      return Promise.reject(response)
    } else {
      if (!window.navigator.onLine) {
        return Promise.reject({ status: 500, msg: '网络异常' })
      }
    }
  }
)
export default fetch

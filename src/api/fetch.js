import axios from 'axios'
// import { ElLoading, ElMessage } from 'element-plus'

axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8'
axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*'
axios.defaults.withCredentials = true // 允许携带cookie

let fetch = axios.create({
  baseURL: 'http://127.0.0.1:8900',
  timeout: 10000,
  withCredentials: true
})

let loadingInstance

// 服务器请求拦截器
fetch.interceptors.request.use(
  (config) => {
    // loadingInstance = ElLoading.service({ lock: false, text: '加载中' })
    console.log('加载中')
    config.headers['JWTToken'] = 'token'
    return config
  },
  (err) => {
    loadingInstance?.close()
    console.log('网络异常')
    return Promise.reject(err)
  }
)

//服务器响应拦截器
fetch.interceptors.response.use(
  (res) => {
    loadingInstance?.close()
    return res.data
  },
  (err) => {
    loadingInstance?.close()
    console.log('数据请求失败')
    return Promise.reject(err)
  }
)
export default fetch

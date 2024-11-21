import fetch from './fetch'
import baseUrl from './baseUrl'

const wenjuan = {
  async get(id) {
    const data = {
      ver: '1.0',
      settings: {},
      data: [
        {
          title: '题目1 多选题',
          id: 'cddhd823',
          type: 'MultiChoice',
          required: true,
          options: [
            { name: '选项1', id: '24jsadQ', fill: { isShow: true, length: 20, type: 'text' } },
            { name: '选项2', id: '123Hd', fill: { isShow: false } },
            { name: '选项3', id: 'Hd74jvf', fill: { isShow: false } }
          ]
        }
      ]
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(data)
      }, 100)
    })
  }
}
export default wenjuan

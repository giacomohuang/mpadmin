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
            { text: '选项1', value: 0, id: '24jsadQ', fill: { isShow: true, length: 20, type: 'text' } },
            { text: '选项2', value: 1, id: '123Hd' },
            { text: '选项3', value: 2, id: 'Hd74jvf' }
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

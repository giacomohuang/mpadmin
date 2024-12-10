import fetch from './fetch'
import baseUrl from './baseUrl'
import { nanoid } from 'nanoid'

const wenjuan = {
  async get(id) {
    const data = {
      ver: '1.0',
      settings: {},
      data: [
        {
          title: '题目1 多选题',
          id: nanoid(),
          type: 'MultiChoice',
          required: true,
          options: [
            { text: '选项1', value: 0, id: nanoid(), fill: { show: true, length: 20, type: 'text' } },
            { text: '选项2', value: 1, id: nanoid() },
            { text: '选项3', value: 2, id: nanoid() }
          ]
        },
        {
          title: '题目2 单选题',
          id: nanoid(),
          type: 'SingleChoice',
          required: true,
          options: [
            { text: '选项1', value: 0, id: nanoid() },
            { text: '选项2', value: 1, id: nanoid() },
            { text: '选项3', value: 2, id: nanoid() },
            { text: '选项3', value: 3, id: nanoid(), fill: { show: true, length: 20, type: 'text' } }
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

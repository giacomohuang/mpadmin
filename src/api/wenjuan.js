import fetch from './fetch'
import baseUrl from './baseUrl'

const wenjuan = {
  list(page, limit, query = {}, sort) {
    console.log('list')
    return fetch({
      baseURL: baseUrl.wenjuan,
      method: 'post',
      data: { page, limit, query, sort },
      url: '/wenjuan/list'
    })
  },
  get(id) {
    return fetch({
      baseURL: baseUrl.wenjuan,
      method: 'post',
      data: { id: id },
      url: '/wenjuan/get'
    })
  },
  update(data) {
    console.log('update API', data)
    return fetch({
      baseURL: baseUrl.wenjuan,
      method: 'post',
      data: JSON.stringify(data),
      url: '/wenjuan/update'
    })
  },
  remove(ids) {
    console.log('remove', ids)
    return fetch({
      baseURL: baseUrl.wenjuan,
      method: 'post',
      data: JSON.stringify(ids),
      url: '/wenjuan/remove'
    })
  }
}
export default wenjuan

import fetch from './fetch'

const permission = {
  getList(group) {
    return fetch({
      params: { group: group },
      url: '/api/permission/getlist',
      method: 'get'
    })
  },
  getList() {
    return fetch({
      url: '/api/permission/getlist',
      method: 'get'
    })
  }
}
export default permission

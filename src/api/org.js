import fetch from './fetch'

export const org = {
  list() {
    return fetch({
      url: '/org/list',
      method: 'post'
    })
  },
  get(id) {
    console.log('get', id)
    return fetch({
      data: { id: id },
      url: '/org/get',
      method: 'post'
    })
  }
}
export default org

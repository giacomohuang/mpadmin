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
  },
  update() {
    return fetch({
      url: '/org/update',
      method: 'post'
    })
  },
  reorder(items) {
    return fetch({
      data: JSON.stringify(items),
      url: '/org/reorder',
      method: 'post'
    })
  },
  add(item) {
    return fetch({
      data: JSON.stringify(item),
      url: '/org/add',
      method: 'post'
    })
  },
  remove(path) {
    return fetch({
      data: JSON.stringify({ path: path }),
      url: '/org/remove',
      method: 'post'
    })
  }
}
export default org

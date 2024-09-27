import fetch from './fetch'

const permission = {
  resource: {
    list(pid, isOneLevel) {
      return fetch({
        data: { pid: pid, isOneLevel },
        url: '/permission/resource/list',
        method: 'post'
      })
    },
    add(item) {
      return fetch({
        data: item,
        url: '/permission/resource/add',
        method: 'post'
      })
    },
    update(item) {
      return fetch({
        data: item,
        url: '/permission/resource/update',
        method: 'post'
      })
    },
    remove(items) {
      console.log('remove api', items)
      return fetch({
        data: JSON.stringify(items),
        url: '/permission/resource/remove',
        method: 'post'
      })
    },
    reorder(ids) {
      return fetch({
        data: JSON.stringify(ids),
        url: '/permission/resource/reorder',
        method: 'post'
      })
    }
  },
  role: {
    list(pid) {
      return fetch({
        data: { pid: pid },
        url: '/permission/role/list',
        method: 'post'
      })
    },
    add(item) {
      console.log('add api', item)
      return fetch({
        data: JSON.stringify(item),
        url: '/permission/role/add',
        method: 'post'
      })
    },
    update(item) {
      console.log('update api', item)
      return fetch({
        data: JSON.stringify(item),
        url: '/permission/role/update',
        method: 'post'
      })
    },
    remove(id) {
      return fetch({
        data: { id: id },
        url: '/permission/role/remove',
        method: 'post'
      })
    },
    reorder(ids) {
      return fetch({
        data: JSON.stringify(ids),
        url: '/permission/role/reorder',
        method: 'post'
      })
    }
  }
}
export default permission

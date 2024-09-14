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
    }
  }
}
export default permission

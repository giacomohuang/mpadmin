import fetch from './fetch'

const permission = {
  resource: {
    list(pid, isOneLevel) {
      return fetch({
        data: { pid: pid, isOneLevel },
        url: '/permission/resource/list',
        method: 'post'
      })
    }
  }
}
export default permission

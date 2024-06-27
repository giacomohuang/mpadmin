import helper from './helper'
import API from '../api/API'

export default {
  install: (app) => {
    // console.log(helper)
    // app.config.globalProperties.$helper = helper
    app.provide('helper', helper)
    app.provide('API', API)
  },
}

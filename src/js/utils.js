import helper from './helper'

export default {
  install: (app) => {
    // console.log(helper)
    // app.config.globalProperties.$helper = helper
    app.provide('helper', helper)
  }
}

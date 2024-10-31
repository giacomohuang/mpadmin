<template>
  <svg class="iconfont" :style="{ height: size, width: size }">
    <use :href="symbolId" />
  </svg>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SvgIcon',
  props: {
    prefix: {
      type: String,
      default: 'icon'
    },
    name: {
      type: String,
      required: true
    },
    size: {
      type: String,
      default: '1.5em'
    }
  },
  setup(props) {
    const symbolId = `#${props.prefix}-${props.name}`
    return { symbolId }
  }
})
</script>

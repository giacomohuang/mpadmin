<script>
import { useIcon } from 'virtual:svg-icons'

export default {
  name: 'SIcon',
  props: {
    name: {
      type: String,
      required: true
    }
  },
  setup(props) {
    return {
      IconComponent: useIcon(props.name)
    }
  }
}
</script>

<template>
  <component :is="IconComponent" />
</template>

<style>
.icon {
  width: 1em;
  height: 1em;
  fill: currentColor;
  vertical-align: middle;
}
</style>

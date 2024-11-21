<template>
  <div>
    <a-radio-group v-model:value="value">
      <a-radio v-for="item in props.data" :key="item.name" :value="item.name">
        {{ item.name }}
      </a-radio>
    </a-radio-group>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const value = ref('')
const props = defineProps(['data'])

onMounted(() => {
  // console.log('singlechoice')
})
</script>

<style scoped lang="scss">
.text {
  font-size: 1vw;
  white-space: nowrap;
  text-align: center;
}
</style>

<template>
  <div class="flex">
    <VueDraggable v-model="list1" :animation="150" ghostClass="ghost" :group="{ name: 'people', pull: 'clone', put: false }" :clone="clone" :sort="false" class="w-300px flex flex-col gap-2 rounded bg-gray-500/5 p-4">
      <div v-for="item in list1" :key="item.id" class="" style="">
        {{ item.name }}
      </div>
    </VueDraggable>
    <VueDraggable v-model="list2" :animation="150" group="people" ghostClass="ghost" class="w-300px max-h-350px m-auto flex flex-col gap-2 overflow-auto rounded bg-gray-500/5 p-4">
      <div v-for="item in list2" :key="item.id" class="h-50px cursor-move rounded bg-gray-500/5 p-3">
        {{ item.name }}
      </div>
    </VueDraggable>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'

const list1 = ref([
  {
    name: 'Joao',
    id: '1'
  },
  {
    name: 'Jean',
    id: '2'
  },
  {
    name: 'Johanna',
    id: '3'
  },
  {
    name: 'Juan',
    id: '4'
  }
])
const list2 = ref(
  list1.value.map((item) => ({
    name: `${item.name}-2`,
    id: `${item.id}-2`
  }))
)

function clone(element: Record<'name' | 'id', string>) {
  const len = list2.value.length
  return {
    name: `${element.name}-clone-${len}`,
    id: `${element.id}-clone-${len}`
  }
}
</script>

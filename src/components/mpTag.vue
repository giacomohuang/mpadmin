<template>
  <span class="tag" :class="[size, color]">
    <slot></slot>
  </span>
</template>

<script setup>
const { size, color } = defineProps(['size', 'color'])
</script>

<style lang="scss" scoped>
/*rtl:begin:ignore*/
.tag {
  border-radius: 6px;
  border: 1px solid;
  padding: 2px 8px;
  font-size: 0.8em;
  color: var(--text-primary);

  &.gray {
    border-color: var(--c-gray-200);
    background-color: var(--c-gray-50);
  }

  &.green {
    border-color: var(--c-green-200);
    background-color: var(--c-green-50);
  }

  &.blue {
    border-color: var(--c-blue-200);
    background-color: var(--c-blue-50);
  }

  &.red {
    border-color: var(--c-red-200);
    background-color: var(--c-red-50);
  }
}
// rtl:end:ignore

[data-theme='dark'] .tag {
  &.gray {
    border-color: var(--c-gray-700);
    background-color: var(--c-gray-800);
  }

  &.green {
    border-color: var(--c-green-700);
    background-color: var(--c-green-800);
  }

  &.blue {
    border-color: var(--c-blue-700);
    background-color: var(--c-blue-800);
  }

  &.red {
    border-color: #220107;
    background-color: #e57373;
  }
}
</style>

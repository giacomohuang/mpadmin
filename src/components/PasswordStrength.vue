<template>
  <div class="strength">
    <ul>
      <li :class="{ s0: value == 0 }"></li>
      <li :class="{ s1: value == 1 }"></li>
      <li :class="{ s2: value == 2 }"></li>
      <li :class="{ s3: value == 3 }"></li>
      <li :class="{ s4: value == 4 }"></li>
    </ul>
    <label>{{ t(strength[value]) }}</label>
  </div>
</template>
<script setup>
import { onBeforeMount, onMounted, ref, watch } from 'vue'
import zxcvbn from 'zxcvbn'
// import { mergeCompData } from '../js/i18n'
import { useI18n } from 'vue-i18n'
const value = defineModel('value')
const data = defineProps(['password'])
// const loading = ref(false)

// 载入语言包
const { locale } = useI18n()
// watch(locale, async () => {
//   loading.value = true
//   // await mergeCompData(locale.value, 'pwdstrength')
//   loading.value = false
// })
// onBeforeMount(async () => {
//   loading.value = true
//   // await mergeCompData(locale.value, 'pwdstrength')
//   loading.value = false
// })

onMounted(() => {
  console.log('mounted')
})

const strength = {
  0: 'components.pwdstrength.weak',
  1: 'components.pwdstrength.fair',
  2: 'components.pwdstrength.good',
  3: 'components.pwdstrength.strong',
  4: 'components.pwdstrength.excellent'
}

watch(
  () => data.password,
  (newValue) => {
    const result = zxcvbn(newValue)
    value.value = result.score
  }
)
</script>
<style lang="scss" scoped>
.strength {
  display: flex;
  flex-direction: row;
  align-items: center;
  background: var(--bg-main);
  width: 100%;

  ul {
    flex-grow: 1;
    display: flex;
    flex-direction: row;
    list-style-type: none;
    border: 1px solid var(--color-border);

    border-radius: 5px;
  }
  li {
    flex-grow: 1;
    height: 10px;
    box-shadow: inset 0 0 0px 2px var(--bg-main);

    transition: all linear 0.15s;
    &:not(:first-child) {
      border-left: 1px solid var(--color-border);
    }
    &:first-child {
      border-radius: 5px 0 0 5px;
    }
    &:last-child {
      border-radius: 0 5px 5px 0;
    }
  }

  label {
    // flex-grow: 1;
    font-size: 12px;
    font-weight: 500;
    margin-left: 12px;
    color: var(--text-secondary);
    width: 60px;
  }

  .s0 {
    flex-grow: 1;
    background-color: var(--c-gray150);
  }
  .s1 {
    flex-grow: 1;
    background-color: var(--c-red60);
  }
  .s2 {
    flex-grow: 1;
    background-color: var(--c-blue40);
  }
  .s3 {
    flex-grow: 1;
    background-color: var(--c-green30);
  }
  .s4 {
    flex-grow: 1;
    background-color: var(--c-green10);
  }
}
</style>

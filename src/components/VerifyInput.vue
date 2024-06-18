<template>
  <div class="verify-wrap" ref="verifyWrap">
    <input v-for="(i, index) in digits" :value="codeArray[index]" :index="index" maxlength="1" @keydown="onKeyDown($event, index)" @animationend="removeShake" />
  </div>
</template>
<script setup>
import { watch, ref, onMounted, nextTick } from 'vue'
const props = defineProps({
  digits: {
    type: Number,
    default: 6
  },
  autofocus: {
    type: Boolean,
    default: false
  }
})
const emits = defineEmits(['finish'])
const digits = props.digits
const autofocus = props.autofocus
const codeArray = ref(Array(digits).fill(''))
const verifyWrap = ref(null)
const isError = defineModel('isError')
const value = defineModel('value')
const isMac = navigator.userAgent.indexOf('Mac') !== -1

onMounted(() => {
  console.log('mounted')
  if (autofocus) {
    verifyWrap.value.querySelectorAll('input')[0].focus()
  }
})

watch(isError, (val) => {
  if (val) {
    console.log('error val', val)
    codeArray.value = Array(digits).fill('')
    verifyWrap.value.querySelectorAll('input').forEach((item) => {
      item.classList.add('shake')
    })
    verifyWrap.value.querySelectorAll('input')[0].focus()
    isError.value = false
  }
})

const removeShake = (e) => {
  e.target.classList.remove('shake')
}

const onKeyDown = async (e, index) => {
  e.preventDefault()
  const ctrlCmdKey = isMac ? e.metaKey : e.ctrlKey
  if (ctrlCmdKey && e.key === 'v') {
    const clipboardData = await navigator.clipboard.readText()
    const pastedNumbers = clipboardData.match(/\d/g) || []
    const clippedNumbers = pastedNumbers.slice(0, digits - index)
    codeArray.value.splice(index, clippedNumbers.length, ...clippedNumbers)
    let idx = index + clippedNumbers.length
    if (idx > digits - 1) idx = digits - 1
    verifyWrap.value.querySelectorAll('input')[idx].focus()
    const code = codeArray.value.join('')
    value.value = code
    if (idx == digits - 1 && code.length === digits) {
      emits('finish', code)
    }
  }
  if (e.key >= '0' && e.key <= '9') {
    e.target.value = e.key
    codeArray.value[index] = e.key
    if (e.target.nextElementSibling) {
      e.target.nextElementSibling.focus()
    } else {
      const code = codeArray.value.join('')
      value.value = code
      if (code.length === digits) {
        // console.log('code:', code)
        emits('finish', code)
      }
    }
  } else if (e.key === 'Backspace') {
    e.target.value = ''
    codeArray.value[index] = ''
    if (e.target.previousElementSibling) e.target.previousElementSibling.focus()
  }
}
</script>

<style lang="scss" scoped>
.verify-wrap :not(:first-child) {
  margin-left: 10px;
}

input {
  all: unset;
  border: 1px solid #666;
  background: var(--bg-input);
  height: 50px;
  width: 50px;
  border: 2px solid transparent;
  border-radius: 20%;
  font-size: 2em;
  font-weight: 600;
  text-align: center;
  caret-color: transparent;

  &:focus,
  .active {
    border-color: var(--bg-brand);
  }
}

.shake {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-2px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(2px);
  }
}
</style>

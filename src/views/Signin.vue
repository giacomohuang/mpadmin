<template>
  <div class="main-wrap radial-gradient">
    <context-holder />
    <header>
      <div class="logo">
        <a href="/"><img src="@/assets/logo.png" width="24" /></a>
      </div>
      <div class="app-name">{{ $t('common.appname') }}</div>
      <div class="lang">
        <a-dropdown>
          <a @click.prevent> <Icon name="global" size="2em" /></a>
          <template #overlay>
            <a-menu @click="onChangeLocale">
              <a-menu-item key="zh-CN">简体中文</a-menu-item>
              <a-menu-item key="en"> English</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
      <div class="theme">
        <Icon name="theme-light" size="2em" class="icon" @click="store.theme = 'light'" :class="{ active1: store.theme === 'light' }"></Icon>
        <Icon name="theme-dark" size="2em" class="icon" @click="store.theme = 'dark'" :class="{ active2: store.theme === 'dark' }"></Icon>
        <Icon name="theme-system" size="2em" class="icon" @click="store.theme = 'system'" :class="{ active3: store.theme === 'system' }"></Icon>
      </div>
    </header>
    <section v-if="state.method === 'pwd'">
      <a-form :model="signinForm" @finish="handleSignin" @finishFailed="handleFailed" autocomplete="off" :label-col="{ span: 5 }" :wrapper-col="{ span: 20 }">
        <h3 class="title">{{ $t('signin.title') }}</h3>
        <a-form-item style="align-items: center" :label="$t('signin.accountname')" name="accountname" :rules="[{ required: true, message: 'Please input your accountname!' }]">
          <a-input autocomplete="off" size="large" large v-model:value="signinForm.accountname" />
          <!-- placeholder="请填写用于登录的邮箱" -->
        </a-form-item>
        <a-form-item style="align-items: center" :label="$t('signin.password')" name="password" :rules="[{ required: true, message: 'Please input your password!' }]">
          <a-input-password autocomplete="off" size="large" v-model:value="signinForm.password" />
          <!-- placeholder="密码" -->
        </a-form-item>
        <a-form-item>
          <a-button type="primary" :loading="state.loading" html-type="submit" style="margin-left: 90px; margin-right: 10px">
            {{ $t('signin.signin') }}
          </a-button>
          <label style="font-size: 12px">30天内没有访问将重新登录</label>
        </a-form-item>
      </a-form>
    </section>
    <section v-if="state.method == 'totp'">
      <h3 class="title">两步验证：动态口令</h3>
      <div class="tips">请查看动态口令APP中的6位动态数字口令，并在下面的的框中输入</div>
      <VerifyInput v-model:value="state.code" :autofocus="true" :digits="6" @finish="handleSignin2FA"></VerifyInput>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, inject } from 'vue'
import { router } from '@/router/router'
import { changeLocale } from '../js/i18n'
import { useStore } from '@/stores/stores'
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import VerifyInput from '../components/VerifyInput.vue'
import API from '../api/API'

const store = useStore()
const helper = inject('helper')
const state = reactive({
  loading: false,
  totpUrl: '',
  code: '',
  method: 'pwd'
})
const { t } = useI18n()
const signinForm = reactive({
  accountname: '',
  password: ''
})

const totpCode = ref('')
const isVerifyError = ref(false)
let totpSecret = ''

const [messageApi, contextHolder] = message.useMessage()

const handleSignin = async (values) => {
  state.loading = true
  try {
    let data = await API.account.signin(values)
    // 如果不需要两步验证
    if (!data.enable2FA) {
      // console.log(data)
      helper.setToken(data)
      const accountInfo = helper.decodeToken()
      router.replace('/')
    }
    // 如果需要两步验证
    else {
      state.method = 'totp'
      console.log('需要两步验证')
    }
  } catch (err) {
    if (err.status == 400) {
      messageApi.error(t('signin.error'))
    } else {
      messageApi.error('系统内部错误')
    }
  } finally {
    state.loading = false
  }
}

const handleSignin2FA = async (callback) => {
  try {
    console.log('code', state.code)
    let data = await API.account.signin2FA({ accountname: signinForm.accountname, password: signinForm.password, authMethod: state.method, code: state.code })
    helper.setToken(data)
    const accountInfo = helper.decodeToken()
    callback(true)
    router.replace('/')
  } catch (err) {
    if (err.status == 400) {
      messageApi.error('动态口令输入错误')
      callback(false)
    } else {
      messageApi.error('系统内部错误')
      callback(false)
    }
  }
}

const handleFailed = (errorInfo) => {
  console.log(errorInfo)
}

const onChangeLocale = ({ key }) => {
  changeLocale(key)
}
</script>

<style lang="scss" scoped>
// input {
//   height: 0 !important;
//   padding: 1.2em 0.5em !important;
//   background-clip: content-box !important;
// }

.main-wrap {
  width: 100vw;
  height: 100vh;
  align-items: flex-start;
  justify-content: center;
  display: flex;
  background-color: var(--bg-main);
}

header {
  display: flex;
  flex-direction: row;
  position: absolute;
  align-items: center;
  padding: 0 12px;
  height: 64px;
  left: 0;
  right: 0;
  font-size: 16px;
  z-index: 12;
  background-color: var(--bg-main-transparent); /* 半透明背景 */
  backdrop-filter: blur(10px); /* 背景模糊 */
  -webkit-backdrop-filter: blur(10px); /* 兼容老版本 Safari */
}

.logo {
  margin-left: 12px;
}
.app-name {
  font-size: 24px;
  padding: 0 20px 0 16px;
  margin-right: 20px;
  color: var(--text-primary);
  font-weight: 600;
  flex-grow: 1;
}

.lang {
  display: block;
  padding: 0 10px;
  margin: 0 10px;
}

.theme {
  cursor: pointer;
  color: var(--c-gray5);
  .active1 {
    color: var(--c-yellow4);
  }
  .active2 {
    color: var(--c-blue3);
  }
  .active3 {
    color: var(--c-black);
  }
}

.title {
  font-size: 20px;
  font-weight: 400;
  color: var(--c-text-main);
  margin: 0px auto 20px auto;
  text-align: center;
}

.tips {
  color: var(--text-secondary);
  margin: 12px 0;
  font-size: 14px;
}

section {
  display: block;
  width: 500px;
  padding: 40px;
  margin-top: 240px;
  // background: var(--bg-layout);
  background-color: var(--bg-main-transparent); /* 半透明背景 */
  backdrop-filter: blur(10px); /* 背景模糊 */
  -webkit-backdrop-filter: blur(10px); /* 兼容老版本 Safari */
  border: 1px solid var(--bg-layout);
  // border:
  border-radius: 4px;
  transition: 0.2s;
  &:hover {
    box-shadow: 0 0 25px 12px var(--bg-shadow);
  }
}

[data-theme='light'] {
  .radial-gradient {
    --bg-main-transparent: rgba(255, 255, 255, 0.3);
    --bg-shadow: #00000012;
    background-color: #fafafa;
    background-image: radial-gradient(closest-side, rgb(192, 233, 255), rgba(235, 105, 78, 0)), radial-gradient(closest-side, rgb(7, 62, 92), rgba(243, 11, 164, 0)), radial-gradient(closest-side, rgb(30, 5, 82), rgba(102, 8, 126, 0)), radial-gradient(closest-side, rgb(195, 111, 0), rgba(170, 142, 245, 0));
    background-size:
      130vw 130vh,
      120vw 120vh,
      100vw 150vh,
      120vw 130vh;
    background-position:
      -80vw -80vh,
      30vw -20vh,
      -20vw 20vh,
      30vw 20vh;
    background-repeat: no-repeat;
    animation: 15s moiveAnimation infinite;
  }
}

[data-theme='dark'] {
  .radial-gradient {
    --bg-main-transparent: rgba(0, 0, 0, 0.2);
    --bg-shadow: #00000012;
    background-color: #443f3f;
    background-image: radial-gradient(closest-side, rgb(7, 46, 66), rgba(235, 105, 78, 0)), radial-gradient(closest-side, rgb(67, 0, 77), rgba(243, 11, 164, 0)), radial-gradient(closest-side, rgb(53, 14, 145), rgba(254, 234, 131, 0)), radial-gradient(closest-side, rgb(89, 50, 0), rgba(170, 142, 245, 0));
    background-size:
      130vw 130vh,
      120vw 120vh,
      100vw 150vh,
      120vw 130vh;
    background-position:
      -80vw -80vh,
      30vw -20vh,
      -20vw 20vh,
      30vw 20vh;
    background-repeat: no-repeat;
    animation: 15s moiveAnimation infinite;
  }
}

@keyframes moiveAnimation {
  0%,
  100% {
    background-size:
      130vw 130vh,
      120vw 120vh,
      100vw 150vh,
      120vw 130vh;
    background-position:
      -80vw -80vh,
      30vw -20vh,
      -20vw 20vh,
      30vw 20vh;
  }
  25% {
    background-size:
      120vw 120vh,
      130vw 150vh,
      130vw 120vh,
      100vw 110vh;
    background-position:
      -30vw -30vh,
      40vw -10vh,
      0vw 10vh,
      -10vw 20vh;
  }
  50% {
    background-size:
      130vw 130vh,
      140vw 100vh,
      100vw 150vh,
      90vw 110vh;
    background-position:
      10vw -60vh,
      20vw 10vh,
      10vw 30vh,
      10vw -20vh;
  }
  75% {
    background-size:
      140vw 140vh,
      100vw 130vh,
      100vw 150vh,
      130vw 110vh;
    background-position:
      -70vw -70vh,
      0vw -10vh,
      30vw -20vh,
      20vw 30vh;
  }
}
</style>

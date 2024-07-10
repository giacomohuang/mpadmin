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
      <a-form :model="signinForm" @finish="handleSignin" autocomplete="off" :label-col="{ span: 5 }" :wrapper-col="{ span: 20 }">
        <h3 class="title">{{ $t('signin.title') }}</h3>
        <a-form-item style="align-items: center" :label="$t('signin.accountname')" name="accountname" :rules="[{ required: true, message: 'Please input your accountname!' }]">
          <a-input autocomplete="off" size="large" large v-model:value="signinForm.accountname" />
          <!-- placeholder="请填写用于登录的邮箱" -->
        </a-form-item>
        <a-form-item style="align-items: center" :label="$t('signin.password')" name="password" :rules="[{ required: true, message: 'Please input your password!' }]">
          <a-input-password autocomplete="new-password" size="large" v-model:value="signinForm.password" />
          <!-- placeholder="密码" -->
        </a-form-item>
        <a-form-item>
          <a-button type="primary" :loading="state.loading" html-type="submit" style="margin: 0 20px 0 90px"> {{ $t('signin.signin') }} </a-button> <a href="####">找回密码</a>
        </a-form-item>
      </a-form>
      <!-- <div style="margin: 0 0 0 90px; font-size: 12px">30天内没有访问将重新登录</div> -->
    </section>

    <section v-if="state.method == 'totp'">
      <h3 class="title">使用动态口令App进行两步验证</h3>
      <div class="tips" style="margin-top: 40px">请查看动态口令App中的6位动态数字口令，并在下面的的框中输入</div>
      <VerifyInput style="width: 100%" class="flex-rc" v-model:value="state.code" :autofocus="true" :digits="6" @finish="handleSignin2FA"></VerifyInput>
      <div class="tips" style="margin-top: 40px">
        更换手机或未安装动态口令App？<a href="####">重新绑定</a><br />
        使用其他方式验证：<a href="####" @click="handleChangeMethod('phone')">手机短信验证</a>&nbsp | &nbsp<a href="####" @click="handleChangeMethod('email')">电子邮件验证</a>
      </div>
    </section>

    <section v-if="state.method == 'email'">
      <h3 class="title">使用电子邮件进行两步验证</h3>
      <div class="flex-rc send" style="margin-top: 40px">
        <h4>{{ helper.obfuscate('email', state.email) }}</h4>
        <div v-if="emailState.isCountDown">{{ emailState.countDownTime }}秒后可重新发送</div>
        <a-button type="primary" v-else="!emailState.isCountDown" @click="handleSendEmail">发送验证码</a-button>
      </div>
      <div v-if="emailState.isSent" style="margin: 30px 0">
        <div class="tips">一封验证邮件已经发送到你的邮箱，请查看邮件中的6位数字验证码，并在下面的的框中输入</div>
        <VerifyInput style="width: 100%" class="flex-rc" v-model:value="state.code" :autofocus="true" :digits="6" @finish="handleSignin2FA"></VerifyInput>
      </div>
      <div class="tips" style="margin-top: 40px">使用其他方式验证：<a href="####" @click="handleChangeMethod('totp')">动态口令App验证(推荐)</a>&nbsp | &nbsp<a href="####" @click="handleChangeMethod('phone')">手机短信验证</a></div>
    </section>

    <section v-if="state.method == 'phone'">
      <h3 class="title">使用手机短信进行两步验证</h3>
      <div class="flex-rc send" style="margin-top: 40px">
        <h4>{{ helper.obfuscate('phone', state.phone) }}</h4>
        <div v-if="phoneState.isCountDown">{{ phoneState.countDownTime }}秒后可重新发送</div>
        <a-button type="primary" v-else="!phoneState.isCountDown" @click="handleSendPhone">发送验证码</a-button>
      </div>
      <div v-if="phoneState.isSent" style="margin: 30px 0">
        <div class="tips">已向你的手机发送了一条验证短信，请查看手机短信中的6位数字验证码，并在下面的的框中输入</div>
        <VerifyInput style="width: 100%" class="flex-rc" v-model:value="state.code" :autofocus="true" :digits="6" @finish="handleSignin2FA"></VerifyInput>
      </div>
      <div class="tips" style="margin-top: 40px">使用其他方式验证：<a href="####" @click="handleChangeMethod('totp')">动态口令App验证(推荐)</a>&nbsp | &nbsp<a href="####" @click="handleChangeMethod('email')">邮件验证</a></div>
    </section>

    <section v-if="state.method == 'initPwd'">
      <h3 class="title">修改初始密码</h3>

      <a-form ref="pwdFormRef" style="margin-top: 30px" :model="pwdForm" :rules="pwdRules" :label-col="{ span: 6 }" @finish="handleInitPwd">
        <a-form-item has-feedback :label="$t('signin.newpwd')" name="newPassword">
          <PasswordStrength v-if="pwdForm.newPassword" v-model:value="state.strength" :password="pwdForm.newPassword" style="position: absolute; top: -20px"></PasswordStrength>
          <a-input-password autocomplete="new-password" v-model:value="pwdForm.newPassword" />
        </a-form-item>
        <a-form-item has-feedback :label="$t('signin.cfpwd')" name="confirm">
          <a-input-password autocomplete="new-password" v-model:value="pwdForm.confirm" />
        </a-form-item>
        <a-form-item :wrapper-col="{ offset: 6 }">
          <a-button type="ghost" @click="handleResetPwdForm">{{ $t('common.cpnt.reset') }}</a-button>
          <a-button type="primary" html-type="submit" style="margin-left: 10px">{{ $t('common.cpnt.submit') }}</a-button>
        </a-form-item>
      </a-form>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { router } from '@/router/router'
import { changeLocale } from '../js/i18n'
import { useStore } from '@/stores/stores'
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import helper from '../js/helper'
import VerifyInput from '../components/VerifyInput.vue'
import API from '../api/API'
import PasswordStrength from '../components/PasswordStrength.vue'

const store = useStore()

const state = reactive({
  loading: false,
  totpUrl: '',
  code: '',
  method: 'pwd',
  email: '',
  phone: '',
  areacode: '',
  accountid: '',
  strength: 0
})
const pwdFormRef = ref(null)

const vPwd = async (_rule, value) => {
  if (value === signinForm.password) {
    return Promise.reject(t('signin.samepwd'))
  } else if (value === '') {
    return Promise.reject(t('signin.pep'))
  } else if (state.strength < 2) {
    return Promise.reject()
  } else if (pwdForm.confirm !== '') {
    pwdFormRef.value.validateFields('confirm')
  }
  return Promise.resolve()
}

const vConfirmPwd = async (_rule, value) => {
  if (value === '') {
    return Promise.reject(t('signin.pepa'))
  } else if (value !== pwdForm.newPassword) {
    return Promise.reject(t('signin.pnm'))
  } else {
    return Promise.resolve()
  }
}

const pwdForm = reactive({
  newPassword: '',
  confirm: ''
})

const pwdRules = {
  newPassword: [{ validator: vPwd, trigger: 'change' }],
  confirm: [{ validator: vConfirmPwd, trigger: 'change' }]
}

const emailState = reactive({
  isSent: false,
  isCountDown: false,
  countDownTime: 0
})

const phoneState = reactive({
  isSent: false,
  isCountDown: false,
  countDownTime: 0
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

const handleChangeMethod = (method) => {
  state.method = method
}

const onChangeLocale = ({ key }) => {
  changeLocale(key)
}

const handleSignin = async (values) => {
  state.loading = true
  try {
    let data = await API.account.signin(values)
    console.log(data)
    state.accountid = data._id
    state.email = data.email
    state.areacode = data.areacode
    state.phone = data.phone
    // 未激活，跳转去激活
    if (!data.initPwd) {
      state.method = 'initPwd'
    }
    // 如果不需要两步验证
    else if (!data.enable2FA) {
      helper.setToken(data)
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
    callback(true)
    emailState.isSent = false
    emailState.isCountDown = false
    phoneState.isSent = false
    phoneState.isCountDown = false
    localStorage.removeItem('phoneCDT')
    localStorage.removeItem('emailCDT')
    clearInterval(emailInterval)
    clearInterval(phoneInterval)
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

const handleSendEmail = async () => {
  try {
    let result = await API.verification.sendCodeByEmail(state.email, state.accountid)
    if (result) {
      emailState.isSent = true
      countDown(emailState, emailInterval, 'email')
    }
  } catch (err) {
    if (err.data.code === 102) {
      messageApi.warning('发送太频繁，请稍后再试')
    } else {
      messageApi.error('系统内部错误')
    }
  }
}

const handleSendPhone = async () => {
  try {
    let result = await API.verification.sendCodeBySMS(state.areacode, state.phone, state.accountid)
    if (result) {
      phoneState.isSent = true
      countDown(phoneState, phoneInterval, 'phone')
    }
  } catch (err) {
    if (err.data.code === 104) {
      messageApi.warning('发送太频繁，请稍后再试')
    } else {
      messageApi.error('系统内部错误')
    }
  }
}

const handleResetPwdForm = () => {
  pwdFormRef.value.resetFields()
}

const handleInitPwd = async () => {
  try {
    const resp = await API.account.initPassword(signinForm.password, pwdForm.newPassword, state.accountid)
    if (resp.result) {
      messageApi.success('密码成功更新!')
      pwdFormRef.value.resetFields()
    } else {
      messageApi.error('初始密码错误，请重试')
    }
  } catch (err) {
    console.log(err)
    return
  }
}

// 倒计时
let emailInterval,
  phoneInterval = undefined

const countDown = (state, intv, type) => {
  let startTime = localStorage.getItem(type + 'CDT')
  let nowTime = new Date().getTime()
  if (startTime) {
    let surplus = 60 - parseInt((nowTime - startTime) / 1000, 10)
    state.countDownTime = surplus <= 0 ? 0 : surplus
  } else {
    state.countDownTime = 60
    localStorage.setItem(type + 'CDT', nowTime)
  }
  state.isCountDown = true
  intv = setInterval(() => {
    state.countDownTime--
    if (state.countDownTime <= 0) {
      localStorage.removeItem(type + 'CDT')
      clearInterval(intv)
      intv = undefined
      state.countDownTime = 60
      state.isCountDown = false
    }
  }, 1000)
}

if (localStorage.getItem('emailCDT')) {
  emailState.isSent = true
  countDown(emailState, emailInterval, 'email')
}

if (localStorage.getItem('phoneCDT')) {
  phoneState.isSent = true
  countDown(phoneState, phoneInterval, 'phone')
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
  line-height: 160%;
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

.send {
  h4 {
    font-size: 18px;
    line-height: 100%;
    margin: 0 20px 0 0;

    padding: 0;
  }
}

[data-theme='light'] {
  .radial-gradient {
    --bg-main-transparent: rgba(255, 255, 255, 0.5);
    --bg-shadow: #00000012;
    background-color: #a0a4a8;
    background-image: radial-gradient(closest-side, rgb(135, 208, 221), rgba(235, 105, 78, 0)), radial-gradient(closest-side, rgb(7, 62, 92), rgba(243, 11, 164, 0)), radial-gradient(closest-side, rgb(30, 5, 82), rgba(102, 8, 126, 0)), radial-gradient(closest-side, rgb(195, 111, 0), rgba(170, 142, 245, 0));
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

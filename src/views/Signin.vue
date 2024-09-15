<template>
  <div class="radial-gradient flex h-screen w-screen items-start justify-center">
    <context-holder />
    <header class="absolute left-0 right-0 z-20 flex h-16 items-center bg-primary/50 px-3">
      <div class="shrink-0 flex-grow whitespace-nowrap px-5">
        <a href="/" class="flex">
          <img src="@/assets/logo.png" class="mr-4 h-6 w-6" />
          <div class="text-2xl/none font-semibold text-[var(--text-primary)]">{{ $t('common.appname') }}</div>
        </a>
      </div>

      <div class="mx-3">
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
      <div class="mr-3 hidden cursor-pointer flex-nowrap text-tertiary md:flex">
        <Icon name="theme-light" size="2em" class="icon" @click="store.changeTheme('light')" :class="{ 'text-orange-400': store.theme === 'light' }"></Icon>
        <Icon name="theme-dark" size="2em" class="icon" @click="store.changeTheme('dark')" :class="{ 'text-blue-500': store.theme === 'dark' }"></Icon>
        <Icon name="theme-system" size="2em" class="icon" @click="store.changeTheme('system')" :class="{ 'text-black': store.theme === 'system' }"></Icon>
      </div>
    </header>
    <section class="mt-60 block w-[500px] rounded border-primary bg-primary/50 p-10 backdrop-blur" v-if="state.method === 'pwd'">
      <a-form :model="signinForm" @finish="handleSignin" autocomplete="off" :label-col="{ span: 6 }">
        <h3 class="mx-auto mb-5 text-xl text-primary">{{ $t('signin.title') }}</h3>
        <a-form-item :label="$t('signin.accountname')" name="accountname" :rules="[{ required: true, message: $t('signin.peya') }]">
          <a-input autocomplete="off" size="large" large v-model:value="signinForm.accountname" />
          <!-- placeholder="请填写用于登录的邮箱" -->
        </a-form-item>
        <a-form-item :label="$t('signin.password')" name="password" :rules="[{ required: true, message: $t('signin.peypwd') }]">
          <a-input-password autocomplete="new-password" size="large" v-model:value="signinForm.password" />
          <!-- placeholder="密码" -->
        </a-form-item>
        <a-form-item>
          <a-button type="primary" :loading="state.loading" html-type="submit" style="margin: 0 20px 0 90px"> {{ $t('signin.signin') }} </a-button> <a href="####" @click="state.method = 'resetPwd'">{{ $t('signin.forgotpwd') }}</a>
        </a-form-item>
      </a-form>
      <!-- <div style="margin: 0 0 0 90px; font-size: 12px">30天内没有访问将重新登录</div> -->
    </section>

    <section class="mt-60 block w-[500px] rounded border-primary bg-primary/50 p-10 backdrop-blur" v-if="state.method == 'totp'">
      <h3 class="m-2 flex items-center text-lg font-semibold text-primary">使用动态口令App进行两步验证</h3>
      <div class="m-3 text-sm/normal text-primary" style="margin-top: 40px">请查看动态口令App中的6位动态数字口令，并在下面的的框中输入</div>
      <VerifyInput style="width: 100%" class="flex items-center justify-center" v-model:value="state.code" :autofocus="true" :digits="6" @finish="handleSignin2FA"></VerifyInput>
      <div class="m-3 text-sm/normal text-primary" style="margin-top: 40px">
        <template v-if="state.methodBit == 7"> 使用其他方式验证：<a href="####" @click="handleChangeMethod('phone')">手机短信验证</a>&nbsp | &nbsp<a href="####" @click="handleChangeMethod('email')">电子邮件验证</a> </template>
        <template v-if="state.methodBit == 5"> 使用其他方式验证：<a href="####" @click="handleChangeMethod('phone')">手机短信验证</a></template>
        <template v-if="state.methodBit == 6"> 使用其他方式验证：<a href="####" @click="handleChangeMethod('email')">电子邮件验证</a></template>
      </div>
    </section>

    <section class="mt-60 block w-[500px] rounded border-primary bg-primary/50 p-10 backdrop-blur" v-if="state.method == 'email'">
      <h3 class="m-2 flex items-center text-lg font-semibold text-primary">使用电子邮件进行两步验证</h3>
      <div class="flex items-center justify-center" style="margin-top: 40px">
        <h4 class="ml-5 p-0 text-lg/none">{{ helper.obfuscate('email', state.email) }}</h4>
        <div v-if="emailState.isCountDown">{{ emailState.countDownTime }}秒后可重新发送</div>
        <a-button type="primary" v-else="!emailState.isCountDown" @click="handleSendEmail">发送验证码</a-button>
      </div>
      <div v-if="emailState.isSent" style="margin: 30px 0">
        <div class="m-3 text-sm/normal text-primary">一封验证邮件已经发送到你的邮箱，请查看邮件中的6位数字验证码，并在下面的的框中输入</div>
        <VerifyInput style="width: 100%" class="flex items-center justify-center" v-model:value="state.code" :autofocus="true" :digits="6" @finish="handleSignin2FA"></VerifyInput>
      </div>
      <div class="m-3 text-sm/normal text-primary" style="margin-top: 40px">
        <template v-if="state.methodBit == 7"> 使用其他方式验证：<a href="####" @click="handleChangeMethod('totp')">动态口令App验证(推荐)</a>&nbsp | &nbsp<a href="####" @click="handleChangeMethod('phone')">手机短信验证</a> </template>
        <template v-else-if="state.methodBit == 6"> 使用其他方式验证：<a href="####" @click="handleChangeMethod('totp')">动态口令App验证(推荐)</a> </template>
        <template v-else-if="state.methodBit == 3"> 使用其他方式验证：<a href="####" @click="handleChangeMethod('phone')">手机短信验证</a> </template>
      </div>
    </section>

    <section class="mt-60 block w-[500px] rounded border-primary bg-primary/50 p-10 backdrop-blur" v-if="state.method == 'phone'">
      <h3 class="m-2 flex items-center text-lg font-semibold text-primary">使用手机短信进行两步验证</h3>
      <div class="flex items-center justify-center" style="margin-top: 40px">
        <h4 class="ml-5 p-0 text-lg/none">{{ helper.obfuscate('phone', state.phone) }}</h4>
        <div v-if="phoneState.isCountDown">{{ phoneState.countDownTime }}秒后可重新发送</div>
        <a-button type="primary" v-else="!phoneState.isCountDown" @click="handleSendPhone">发送验证码</a-button>
      </div>
      <div v-if="phoneState.isSent" style="margin: 30px 0">
        <div class="m-3 text-sm/normal text-primary">已向你的手机发送了一条验证短信，请查看手机短信中的6位数字验证码，并在下面的的框中输入</div>
        <VerifyInput style="width: 100%" class="flex items-center justify-center" v-model:value="state.code" :autofocus="true" :digits="6" @finish="handleSignin2FA"></VerifyInput>
      </div>
      <div class="m-3 text-sm/normal text-primary" style="margin-top: 40px">
        <template v-if="state.methodBit == 7"> 使用其他方式验证：<a href="####" @click="handleChangeMethod('totp')">动态口令App验证(推荐)</a>&nbsp | &nbsp<a href="####" @click="handleChangeMethod('email')">电子邮件验证</a> </template>
        <template v-else-if="state.methodBit == 5"> 使用其他方式验证：<a href="####" @click="handleChangeMethod('totp')">动态口令App验证(推荐)</a> </template>
        <template v-else-if="state.methodBit == 3"> 使用其他方式验证：<a href="####" @click="handleChangeMethod('email')">电子邮件验证</a> </template>
      </div>
    </section>

    <section class="mt-60 block w-[500px] rounded border-primary bg-primary/50 p-10 backdrop-blur" v-if="state.method == 'initPwd'">
      <h3 class="m-2 flex items-center text-lg font-semibold text-primary">需要更新密码</h3>
      <div class="m-3 text-sm/normal text-primary">首次登录或长时间没有修改密码，需要重新设置密码</div>
      <a-form ref="pwdFormRef" style="margin-top: 30px" :model="pwdForm" :rules="pwdRules" :label-col="{ span: 6 }" @finish="handleInitPwd">
        <a-form-item has-feedback :label="$t('signin.newpwd')" name="newPassword">
          <PasswordStrength v-if="pwdForm.newPassword" v-model:value="state.strength" :password="pwdForm.newPassword" style="position: absolute; top: -20px"></PasswordStrength>
          <a-input-password autocomplete="new-password" size="large" v-model:value="pwdForm.newPassword" />
        </a-form-item>
        <a-form-item has-feedback :label="$t('signin.cfpwd')" name="confirm">
          <a-input-password autocomplete="new-password" size="large" v-model:value="pwdForm.confirm" />
        </a-form-item>
        <a-form-item :wrapper-col="{ offset: 6 }">
          <a-button type="ghost" @click="handleResetPwdForm">{{ $t('common.reset') }}</a-button>
          <a-button type="primary" html-type="submit" style="margin-left: 10px">{{ $t('common.submit') }}</a-button>
        </a-form-item>
      </a-form>
    </section>

    <section class="mt-60 block w-[500px] rounded border-primary bg-primary/50 p-10 backdrop-blur" v-if="state.method == 'resetPwd'">
      <h3 class="m-2 flex items-center text-lg font-semibold text-primary">重置密码</h3>
      使用以下方式接收临时密码，使用临时密码登录后，再设置新的密码。
      <a-form-item>
        <a-radio-group v-model:value="state.resetPwdMethod">
          <a-radio value="email">{{ $t('signin.email') }}</a-radio>
          <a-radio value="phone">{{ $t('signin.phone') }}</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item v-if="state.resetPwdMethod">
        <a-input size="large" placeholder="请输入与账号绑定的电子邮件地址" v-if="state.resetPwdMethod === 'email'"></a-input>
        <a-input size="large" placeholder="请输入与账号绑定的手机号" v-if="state.resetPwdMethod === 'phone'"></a-input>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="handleSendTempPwd">{{ $t('common.send') }}</a-button>
      </a-form-item>
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
  activationUrl: '',
  code: '',
  method: 'pwd',
  email: '',
  phone: '',
  areacode: '',
  accountid: '',
  strength: 0,
  enable2FA: true,
  methodBit: 0,
  resetPwdMethod: ''
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
    state.accountid = data._id
    state.email = data.email
    state.areacode = data.areacode
    state.phone = data.phone
    state.enable2FA = data.enable2FA
    state.totpSecret = data.totpSecret
    state.methodBit = state.methodBit | (data.phone ? 1 : 0) | (data.email ? 2 : 0) | (data.totpSecret ? 4 : 0)
    console.log(data)

    // 未激活，跳转去激活
    if (!data.initPwd) {
      state.method = 'initPwd'
    }
    // 如果不需要两步验证
    else if (!data.enable2FA) {
      console.log('no 2da', data)
      helper.setToken(data)
      router.replace('/')
    }
    // 如果需要两步验证
    else {
      //TODO 根据已有的验证方式跳转：优先级：totp > phone > email
      if (state.methodBit & 4) {
        state.method = 'totp'
      } else if (state.methodBit & 1) {
        state.method = 'phone'
      } else if (state.methodBit & 2) {
        state.method = 'email'
      }
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
      messageApi.success('密码更新成功，请重新登录!')
      pwdFormRef.value.resetFields()
      state.method = 'pwd'
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
// .title {
//   font-size: 20px;
//   font-weight: 400;
//   color: var(--c-text-main);
//   margin: 0px auto 20px auto;
//   text-align: center;
// }

// .tips {
//   color: var(--text-secondary);
//   margin: 12px 0;
//   font-size: 14px;
//   line-height: 160%;
// }

// section {
//   display: block;
//   width: 500px;
//   padding: 40px;
//   margin-top: 240px;
//   // background: var(--bg-layout);
//   background-color: var(--bg-main-transparent); /* 半透明背景 */
//   backdrop-filter: blur(10px); /* 背景模糊 */
//   -webkit-backdrop-filter: blur(10px); /* 兼容老版本 Safari */
//   border: 1px solid var(--bg-layout);
//   // border:
//   border-radius: 4px;
//   transition: 0.2s;
//   &:hover {
//     box-shadow: 0 0 25px 12px var(--bg-shadow);
//   }
// }

// .send {
//   h4 {
//     font-size: 18px;
//     line-height: 100%;
//     margin: 0 20px 0 0;

//     padding: 0;
//   }
// }

// .step {
//   margin: 40px 0 0 0;
//   .title {
//     display: flex;
//     align-items: center;
//     font-weight: 20px;
//     color: var(--text-primary);
//     font-size: 18px;
//     font-weight: 800;
//     margin: 5px 0;
//   }
//   .hint {
//     color: var(--text-secondary);
//     margin-left: 35px;
//   }
// }

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

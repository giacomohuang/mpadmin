<template>
  <div class="main">
    <section>
      <div class="title flex flex-item-c">
        <h2>{{ $t('my.authentication.pwd') }}</h2>
        <a-button @click.stop="status.toggleChangePwd = !status.toggleChangePwd">{{ status.toggleChangePwd ? $t('my.authentication.hide') : $t('my.authentication.cpwd') }}</a-button>
      </div>
      <div class="tips">{{ $t('my.authentication.syaeyps') }}</div>
      <div v-if="status.toggleChangePwd" class="content">
        <a-form ref="pwdFormRef" :model="pwdForm" :rules="pwdRules" :label-col="{ span: 6 }" :wrapper-col="{ span: 12 }" @validate="handlePwdValidate">
          <a-form-item has-feedback :label="$t('my.authentication.oldpwd')" name="oldPassword">
            <a-input-password v-model:value="pwdForm.oldPassword" />
          </a-form-item>
          <a-form-item has-feedback :label="$t('my.authentication.newpwd')" name="newPassword">
            <ul v-if="pwdForm.newPassword" class="strength">
              <li :class="{ s0: status.strength == 0 }">
                <label v-if="status.strength == 0">{{ $t('my.authentication.week') }}</label>
              </li>
              <li :class="{ s1: status.strength == 1 }">
                <label v-show="status.strength == 1">{{ $t('my.authentication.fair') }}</label>
              </li>
              <li :class="{ s2: status.strength == 2 }">
                <label v-show="status.strength == 2">{{ $t('my.authentication.good') }}</label>
              </li>
              <li :class="{ s3: status.strength == 3 }">
                <label v-show="status.strength == 3">{{ $t('my.authentication.strong') }}</label>
              </li>
              <li :class="{ s4: status.strength == 4 }">
                <label v-show="status.strength == 4">{{ $t('my.authentication.excellent') }}</label>
              </li>
            </ul>
            <a-input-password v-model:value="pwdForm.newPassword" />
          </a-form-item>
          <a-form-item has-feedback :label="$t('my.authentication.cfpwd')" name="confirmPassword">
            <a-input-password v-model:value="pwdForm.confirmPassword" />
          </a-form-item>
          <a-form-item :wrapper-col="{ offset: 6 }">
            <a-button type="ghost" @click="handleResetPwdForm">{{ $t('common.cpnt.reset') }}</a-button>
            <a-button type="primary" html-type="submit" style="margin-left: 10px">{{ $t('common.cpnt.submit') }}</a-button>
          </a-form-item>
        </a-form>
      </div>
    </section>
    <section>
      <div class="title flex flex-item-c">
        <h2>{{ $t('my.authentication.email') }}</h2>
      </div>
      <div class="item"><label>未设置</label><a-button @click="status.setEmailVisible = true">设置</a-button></div>
      <div class="item">
        <label>{{ helper.obfuscate('email', emailForm.email) }}</label>
        <a-button>{{ $t('my.authentication.edit') }}</a-button>
      </div>
      <a-modal v-model:open="status.setEmailVisible" title="设置电子邮件" ok-text="确定" cancel-text="取消" @ok="handleSetEmail" @cancel="handleCancelSetEmail">
        <a-form ref="emailFormRef" :model="emailForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 12 }">
          <a-form-item
            :label="$t('my.authentication.emailad')"
            name="email_new"
            :rules="[
              { required: true, message: '请输入电子邮件地址' },
              { type: 'email', message: '请输入正确的电子邮件地址' }
            ]"
          >
            <a-input v-model:value="emailForm.email_new" />
            <a @click="handleGetEmailCode" v-if="!status.isCountDown" style="margin-top: 20px">{{ $t('my.authentication.svcode') }}</a>
            <span v-else>{{ status.countDownTime }}秒后可重新发送</span>
          </a-form-item>
        </a-form>
        <div class="flex flex-cnt-c verifycode" v-if="status.emailSended">
          <VerifyInput v-model:value="status.verifyCode" v-model:isError="status.isVerifyError" :autofocus="true" :digits="4"></VerifyInput>
        </div>
      </a-modal>
    </section>
    <section>
      <div class="title flex flex-item-c">
        <h2>{{ $t('my.authentication.mobi') }}</h2>
      </div>
      <div class="item">
        <label>{{ $t('my.authentication') }}</label>
        <a-button @click="">设置</a-button>
      </div>
      <div class="item">
        <label>{{ helper.obfuscate('phone', '15618036377') }}</label>
        <a-button>{{ $t('my.authentication.edit') }}</a-button>
      </div>
    </section>
    <section>
      <div class="title flex flex-item-c">
        <h2>{{ $t('my.authentication.totp') }}</h2>
      </div>
      <div class="item"><label>未设置</label><a-button>设置</a-button></div>
      <div class="item">
        <label>重新绑定</label><a-button>{{ $t('my.authentication.edit') }}</a-button>
      </div>
    </section>
  </div>
</template>
<script setup>
import { inject, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import zxcvbn from 'zxcvbn'
import helper from '../../js/helper'
import VerifyInput from '../../components/VerifyInput.vue'

const { t } = useI18n()
const pwdFormRef = ref()
const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const emailFormRef = ref()

const emailForm = reactive({
  email: 'tcomc@msn.com',
  email_new: ''
})

const status = reactive({
  toggleChangePwd: false,
  strength: 0,
  setEmailVisible: false,
  emailSended: false,
  isCountDown: false,
  countDownTime: 60,
  verifyCode: '',
  isVerifyError: false
})

const vPwd = async (_rule, value) => {
  status.strength = zxcvbn(value).score
  if (status.strength < 3) {
    return Promise.reject()
  }
  if (value === '') {
    return Promise.reject(t('my.authentication.pep'))
  } else {
    if (pwdForm.confirmPassword !== '') {
      pwdFormRef.value.validateFields('confirmPassword')
    }
    return Promise.resolve()
  }
}
const vConfirmPwd = async (_rule, value) => {
  if (value === '') {
    return Promise.reject(t('my.authentication.pepa'))
  } else if (value !== pwdForm.newPassword) {
    return Promise.reject(t('my.authentication.pnm'))
  } else {
    return Promise.resolve()
  }
}

const pwdRules = {
  oldPassword: [{ required: true, message: t('my.authentication.pep') }],
  newPassword: [{ required: true, validator: vPwd, trigger: 'change' }],
  confirmPassword: [{ validator: vConfirmPwd, trigger: 'change' }]
}

const emailRules = {
  email: [
    { required: true, message: '请输入电子邮件地址', trigger: 'change' },
    { type: 'email', message: '请输入正确的电子邮件地址', trigger: 'change' }
  ]
}

const handlePwdValidate = (...args) => {
  console.log('handle')
  console.log(args)
}
const handleResetPwdForm = () => {
  pwdFormRef.value.resetFields()
}

const handleSetEmail = () => {
  console.log('handle')
}
const handleCancelSetEmail = () => {
  console.log('cancel')
  status.emailSended = false
  status.email_mew = ''
}

const handleGetEmailCode = async () => {
  try {
    //do get email code
    //if sccuess
    const val = await emailFormRef.value.validateFields('email_new')
    status.emailSended = true
    status.emailCountDown = true
    countDown()
  } catch {
    status.emailSended = false
    return
  }
}

const countDown = () => {
  let startTime = localStorage.getItem('emailCDT')
  let nowTime = new Date().getTime()
  if (startTime) {
    let surplus = 60 - parseInt((nowTime - startTime) / 1000, 10)
    status.countDownTime = surplus <= 0 ? 0 : surplus
    // console.log(status.countDownTime, status.countDownTime)
  } else {
    status.countDownTime = 60
    localStorage.setItem('emailCDT', nowTime)
  }
  const timer = setInterval(() => {
    status.countDownTime--
    status.isCountDown = true
    if (status.countDownTime <= 0) {
      localStorage.removeItem('emailCDT')
      clearInterval(timer)
      status.countDownTime = 60
      status.isCountDown = false
    }
  }, 1000)
}
</script>
<style lang="scss" scoped>
@import '../../assets/page.scss';

.strength {
  display: flex;
  list-style-type: none;
  border: 1px solid var(--color-border);
  background: var(--bg-main);
  border-radius: 5px;
  width: 100%;
  margin-top: 12px;
  margin-bottom: 24px;
  li {
    flex-grow: 0.5;
    box-shadow: inset 0 0 0px 4px var(--bg-main);
    text-align: center;
    height: 12px;
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
    label {
      font-size: 12px;
      position: relative;
      top: 12px;
      color: var(--text-secondary);
    }
  }

  .s0 {
    flex-grow: 1;
    background-color: var(--c-gray5);
  }
  .s1 {
    flex-grow: 1;
    background-color: var(--c-red1);
  }
  .s2 {
    flex-grow: 1;
    background-color: var(--c-blue3);
  }
  .s3 {
    flex-grow: 1;
    background-color: var(--c-green1);
  }
  .s4 {
    flex-grow: 1;
    background-color: var(--c-green4);
  }
}

.verifycode {
  margin: 20px 0 50px 0;
}
</style>

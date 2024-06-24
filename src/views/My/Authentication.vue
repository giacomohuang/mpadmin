<template>
  <a-spin :spinning="status.dataLoading" style="margin: 20px"></a-spin>
  <context-holder />
  <div class="main" v-show="!status.dataLoading">
    <section>
      <div class="title flex flex-item-c flex-betwwen">
        <h2>{{ $t('my.authentication.pwd') }}</h2>
        <a-button @click.stop="status.toggleChangePwd = !status.toggleChangePwd">{{ status.toggleChangePwd ? $t('my.authentication.hide') : $t('my.authentication.cpwd') }}</a-button>
      </div>
      <div class="tips">{{ $t('my.authentication.syaeyps') }}</div>
      <div v-if="status.toggleChangePwd" class="content">
        <a-form ref="pwdFormRef" :model="pwdForm" :rules="pwdRules" :label-col="{ span: 6 }" :wrapper-col="{ span: 12 }" @validate="handlePwdValidate" @finish="handleUpdatePwd">
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
        <h2>{{ $t('my.authentication.mobi') }}</h2>
      </div>
      <div class="tips">使用手机短信验证码增强账户安全</div>
      <div class="item">
        <label>{{ phoneForm.areacode }} {{ phoneForm.phone ? helper.obfuscate('phone', phoneForm.phone) : $t('my.authentication.notset') }}</label>
        <a-button @click="status.setPhoneVisible = true">{{ phoneForm.phone ? $t('my.authentication.edit') : $t('my.authentication.set') }}</a-button>
      </div>
      <a-modal v-model:open="status.setPhoneVisible" :title="phoneForm.phone ? $t('my.authentication.editphone') : $t('my.authentication.setphone')" :footer="null" @cancel="handleCancelSet" width="530px">
        <a-form style="margin-top: 40px" ref="phoneFormRef" layout="inline" :model="phoneForm">
          <a-form-item :label="$t('my.authentication.phonead')">
            <a-select show-search v-model:value="phoneForm.areacodeNew" style="width: 100px" placeholder="国际区号" allowClear :dropdown-match-select-width="false">
              <a-select-option v-for="(item, index) in areaCode" :key="index" :value="item.code">{{ item.code }}({{ item[locale] }})</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item has-feedback name="phoneNew" :rules="phoneRules">
            <a-input v-model:value="phoneForm.phoneNew" style="width: 140px" />
          </a-form-item>
          <a-form-item>
            <a-button @click="handleSendSMS" v-if="!phoneStatus.isCountDown" :loading="status.loading" class="resend" type="link">{{ $t('my.authentication.svcode') }}</a-button>
            <span class="resend resend-hint" v-if="phoneStatus.isCountDown">{{ $t('my.authentication.resendin', phoneStatus.countDownTime) }}</span>
          </a-form-item>
        </a-form>
        <div class="flex-col flex-item-c verifycode" v-if="phoneStatus.isSend">
          <div class="hint">{{ $t('my.authentication.rsvphone') }}</div>
          <VerifyInput v-model:value="phoneStatus.verifyCode" v-model:isError="phoneStatus.isVerifyError" :autofocus="true" :digits="4" @finish="handleUpdatePhone"></VerifyInput>
        </div>
      </a-modal>
    </section>
    <section>
      <div class="title flex flex-item-c">
        <h2>{{ $t('my.authentication.totp') }}</h2>
      </div>
      <div class="tips">使用动态口令增强账户安全</div>
      <div class="item">
        <label>{{ totpForm.totpSecret ? $t('my.authentication.havset') : $t('my.authentication.notset') }}</label>
        <a-button @click="status.setTotpVisible = true">{{ totpForm.totpSecret ? $t('my.authentication.edit') : $t('my.authentication.set') }}</a-button>
      </div>
      <a-modal v-model:open="status.setTotpVisible" :title="totpForm.totpSecret ? $t('my.authentication.edittotp') : $t('my.authentication.settotp')" :footer="null" @cancel="handleCancelSet"> </a-modal>
    </section>

    <section>
      <div class="title flex flex-item-c">
        <h2>{{ $t('my.authentication.email') }}</h2>
      </div>
      <div class="tips">使用电子邮件验证码强化增强账户安全</div>
      <div class="item">
        <label>{{ emailForm.email ? helper.obfuscate('email', emailForm.email) : $t('my.authentication.notset') }}</label>
        <a-button @click="status.setEmailVisible = true">{{ emailForm.email ? $t('my.authentication.edit') : $t('my.authentication.set') }}</a-button>
      </div>
      <a-modal v-model:open="status.setEmailVisible" :title="emailForm.email ? $t('my.authentication.editemail') : $t('my.authentication.setemail')" :footer="null" @cancel="handleCancelSet">
        <a-form style="margin-top: 40px" ref="emailFormRef" :model="emailForm" layout="inline">
          <a-form-item has-feedback :label="$t('my.authentication.emailad')" name="emailNew" :rules="emailRules">
            <a-input v-model:value="emailForm.emailNew" />
          </a-form-item>
          <a-form-item>
            <a-button @click="handleSendEmail" v-if="!emailStatus.isCountDown" :loading="status.loading" type="link" class="resend">{{ $t('my.authentication.svcode') }}</a-button>
            <span class="resend resend-hint" v-if="emailStatus.isCountDown">{{ $t('my.authentication.resendin', emailStatus.countDownTime) }}</span>
          </a-form-item>
        </a-form>
        <div class="flex-col flex-item-c verifycode" v-if="emailStatus.isSend">
          <div class="hint">{{ $t('my.authentication.rsvemail') }}</div>
          <VerifyInput v-model:value="emailStatus.verifyCode" v-model:isError="emailStatus.isVerifyError" :autofocus="true" :digits="4" @finish="handleUpdateEmail"></VerifyInput>
        </div>
      </a-modal>
    </section>
  </div>
</template>
<script setup>
// common
import { inject, toRefs, onUnmounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from '@/stores/stores'
import { message } from 'ant-design-vue'
import API from '../../api/API'

import zxcvbn from 'zxcvbn'
import helper from '../../js/helper'
import VerifyInput from '../../components/VerifyInput.vue'
import areaCode from '../../js/areacode'

const { t, locale } = useI18n()
const store = useStore()
const { accountid } = toRefs(store)
const [messageApi, contextHolder] = message.useMessage()

let emailInterval,
  phoneInterval = undefined

const status = reactive({
  toggleChangePwd: false,
  strength: 0,
  setEmailVisible: false,
  setPhoneVisible: false,
  setTotpVisible: false,
  loading: false,
  dataLoading: true
})

const pwdFormRef = ref()
const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const emailFormRef = ref()

const emailForm = reactive({
  email: '',
  emailNew: ''
})
const emailStatus = reactive({
  isCountDown: false,
  countDownTime: 0,
  isSend: false,
  verifyCode: '',
  isVerifyError: false
})

const phoneFormRef = ref()
const phoneForm = reactive({
  areacode: null,
  phone: '',
  areacodeNew: null,
  phoneNew: null
})

const totpForm = reactive({
  totpSecret: ''
})

const phoneStatus = reactive({
  isCountDown: false,
  countDownTime: 0,
  isSend: false,
  verifyCode: '',
  isVerifyError: false
})

const otpFormRef = ref()

const vPwd = async (_rule, value) => {
  status.strength = zxcvbn(value).score
  if (status.strength < 2) {
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

const vEmail = async (_rule, value) => {
  console.log(value, emailForm.email)
  if (value && value === emailForm.email) {
    return Promise.reject()
  } else {
    return Promise.resolve()
  }
}

const vPhone = async (_rule, value) => {
  const cnPhoneRegex = /^1[3-9]\d{9}$/
  const internationalPhoneRegex = /^\+\d{1,3}\d{5,14}$/
  // 如果手机号与之前相同
  if (!value) {
    return Promise.reject('请输入手机号码')
  } else if (phoneForm.areacodeNew + value === phoneForm.areacode + phoneForm.phone) {
    return Promise.reject('请输入与之前不同的号码')
  }
  // 验证手机号码格式
  if (!cnPhoneRegex.test(value) && !internationalPhoneRegex.test(value)) {
    return Promise.reject('请输入正确的手机号码')
  } else {
    return Promise.resolve()
  }
}

const pwdRules = {
  oldPassword: [{ required: true, message: t('my.authentication.pep') }],
  newPassword: [{ required: true, validator: vPwd, trigger: 'change' }],
  confirmPassword: [{ validator: vConfirmPwd, trigger: 'change' }]
}

const emailRules = [
  { required: true, message: '请输入电子邮件地址', trigger: 'blur' },
  { type: 'email', message: '请输入正确的电子邮件地址', trigger: 'blur' },
  { validator: vEmail, message: '请输入与之前不同的电子邮件地址', trigger: 'blur' }
]

const phoneRules = [{ validator: vPhone, trigger: 'blur' }]

const handlePwdValidate = (...args) => {
  console.log('handle', args)
}
const handleResetPwdForm = () => {
  pwdFormRef.value.resetFields()
}

const handleCancelSet = () => {
  console.log('cancel')
  status.verifyCode = ''
}

const handleUpdatePwd = async () => {
  try {
    const resp = await API.my.updatePassword(pwdForm.oldPassword, pwdForm.newPassword)
    if (resp.result) {
      messageApi.success('密码成功更新!')
      pwdFormRef.value.resetFields()
      status.toggleChangePwd = !status.toggleChangePwd
    } else {
      messageApi.success('旧密码输入错误，请重试')
    }
  } catch (err) {
    console.log(err)
    return
  }
}

const handleSendEmail = async () => {
  // 表单验证
  try {
    await emailFormRef.value.validateFields()
  } catch (err) {
    console.log(err)
    emailStatus.isSend = false
    return
  }

  // 向指定邮箱发送验证邮件
  try {
    status.loading = true
    const resp = await API.my.sendCodeByEmail(emailForm.emailNew)
    if (resp.result) {
      status.loading = false
    } else {
      throw new Error({ message: '邮件发送失败(40001)' })
    }
  } catch (err) {
    console.log(err)
    messageApi.error('邮件发送失败(40001, 请重试', 1)
    status.loading = true
    emailStatus.isSend = false
    return
  }
  // 启动倒计时
  emailStatus.isSend = true
  countDown(emailStatus, emailInterval, 'email')
}

const handleUpdateEmail = async () => {
  console.log('finish')
  try {
    //do verify email code
    //if sccuess
    const resp = await API.my.updateEmail(emailStatus.verifyCode, emailForm.emailNew)
    if (resp.result) {
      emailForm.email = emailForm.emailNew
      emailForm.emailNew = ''
      localStorage.removeItem('emailCDT')
      localStorage.removeItem('cur_email')
      status.setEmailVisible = false
      emailStatus.verifyCode = ''
      emailStatus.isVerifyError = false
      emailStatus.isSend = false
      emailStatus.countDownTime = 60
      emailStatus.isCountDown = false
      if (emailStatus) clearInterval(emailInterval)
    } else {
      emailStatus.isVerifyError = true
    }
  } catch (e) {
    console.log(e)
    emailStatus.isVerifyError = true
    return
  }
}

const handleSendSMS = async () => {
  // 表单验证
  console.log('send')
  try {
    await phoneFormRef.value.validateFields()
  } catch (err) {
    console.log(err)
    phoneStatus.isSend = false
    return
  }

  // 向指定手机发送验证短信
  try {
    status.loading = true
    const resp = await API.my.updatePhone(phoneForm.areacode, phoneForm.phoneNew)
    if (resp.result) {
      status.loading = false
    } else {
      throw new Error({ message: '短信发送失败(50001)' })
    }
  } catch (err) {
    console.log(err)
    messageApi.error('短信发送失败(40001, 请重试', 1)
    status.loading = true
    phoneStatus.isSend = false
    return
  }
  // 启动倒计时
  phoneStatus.isSend = true
  countDown(phoneStatus, phoneInterval, 'phone')
}

const handleUpdatePhone = async () => {
  try {
    const resp = await API.my.updatePhone(phoneStatus.verifyCode, phoneForm.areacodeNew, phoneForm.phoneNew)
    if (resp.result) {
      phoneForm.phone = phoneForm.phoneNew
      phoneForm.areacode = phoneForm.areacodeNew
      phoneForm.phoneNew = ''
      phoneForm.areacodeNew = ''
      localStorage.removeItem('phoneCDT')
      localStorage.removeItem('cur_phone')
      status.setPhoneVisible = false
      phoneStatus.verifyCode = ''
      phoneStatus.isVerifyError = false
      phoneStatus.isSend = false
      phoneStatus.countDownTime = 60
      phoneStatus.isCountDown = false
      if (phoneStatus) clearInterval(phoneInterval)
    } else {
      phoneStatus.isVerifyError = true
    }
  } catch (e) {
    console.log(e)
    phoneStatus.isVerifyError = true
    return
  }
}

const countDown = (obj, intv, type) => {
  let startTime = localStorage.getItem(type + 'CDT')
  let nowTime = new Date().getTime()
  if (startTime) {
    let surplus = 60 - parseInt((nowTime - startTime) / 1000, 10)
    obj.countDownTime = surplus <= 0 ? 0 : surplus
    // console.log(status.countDownTime, status.countDownTime)
  } else {
    obj.countDownTime = 60
    localStorage.setItem(type + 'CDT', nowTime)
    localStorage.setItem('cur_' + type, emailForm.emailNew)
  }
  obj.isCountDown = true
  intv = setInterval(() => {
    obj.countDownTime--
    if (obj.countDownTime <= 0) {
      localStorage.removeItem(type + 'CDT')
      localStorage.removeItem('cur_' + type)
      clearInterval(intv)
      intv = undefined
      obj.countDownTime = 60
      obj.isCountDown = false
    }
  }, 1000)
}

emailForm.emailNew = localStorage.getItem('cur_email')
if (localStorage.getItem('emailCDT')) {
  emailStatus.isSend = true
  countDown(emailStatus, emailInterval, 'email')
}

// 本页面初始数据准备
async function getMyAuthInfo() {
  status.dataLoading = true
  const resp = await API.my.getAuthInfo()
  console.log(resp)
  emailForm.email = resp.email
  phoneForm.areacode = resp.areacode
  phoneForm.phone = resp.phone
  status.dataLoading = false
}

getMyAuthInfo()

onUnmounted(() => {
  if (emailInterval) clearInterval(emailInterval)
})
</script>
<style lang="scss" scoped>
@import '../../assets/page.scss';

.resend {
  font-size: 12px;
  // padding-left: 12px;
}
.resend-hint {
  color: var(--text-secondary);
}

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
      font-weight: 500;
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
  margin: 20px 0 20px 0;
  .hint {
    font-size: 12px;
    // text-align: center;
    padding: 12px;
  }
}
</style>

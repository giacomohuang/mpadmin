<template>
  <div class="main">
    <section>
      <div class="title flex flex-item-c">
        <h2>{{ $t('my.auth.pwd') }}</h2>
        <a-button @click.stop="status.toggleChangePwd = !status.toggleChangePwd">{{ status.toggleChangePwd ? $t('my.auth.hide') : $t('my.auth.cpwd') }}</a-button>
      </div>
      <div class="hint">Strengthen your account by ensuring your password is strong.</div>
      <div v-if="status.toggleChangePwd" class="content">
        <a-form ref="pwdFormRef" :model="pwdForm" :label-col="{ span: 6 }" :rules="pwdRules" :wrapper-col="{ span: 12 }" @validate="handlePwdValidate">
          <a-form-item has-feedback :label="$t('my.auth.oldpwd')" name="oldPassword">
            <a-input type="password" v-model:value="pwdForm.oldPassword" />
          </a-form-item>
          <a-form-item has-feedback :label="$t('my.auth.newpwd')" name="newPassword">
            <a-input type="password" v-model:value="pwdForm.newPassword" />
          </a-form-item>
          <a-form-item has-feedback :label="$t('my.auth.cfpwd')" name="confirmPassword">
            <a-input type="password" v-model:value="pwdForm.confirmPassword" />
          </a-form-item>
          <a-form-item :wrapper-col="{ offset: 6 }">
            <a-button type="primary">{{ $t('common.submit') }}</a-button>
          </a-form-item>
        </a-form>
      </div>
    </section>
  </div>
</template>
<script setup>
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const pwdFormRef = ref()
const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const status = reactive({
  toggleChangePwd: false
})

const vPwd = async (_rule, value) => {
  console.log('aaaa')
  if (value === '') {
    return Promise.reject(t('my.auth.pep'))
  } else {
    if (pwdForm.confirmPassword !== '') {
      pwdFormRef.value.validateFields('confirmPassword')
    }
    return Promise.resolve()
  }
}
const vConfirmPwd = async (_rule, value) => {
  console.log('bbbb')
  if (value === '') {
    return Promise.reject(t('my.auth.pepa'))
  } else if (value !== pwdForm.newPassword) {
    return Promise.reject(t('my.auth.pnm'))
  } else {
    return Promise.resolve()
  }
}

const pwdRules = {
  newPassword: [{ required: true, validator: vPwd, trigger: 'change' }],
  confirmPassword: [{ validator: vConfirmPwd, trigger: 'change' }]
}

const handlePwdValidate = (...args) => {
  console.log('handle')
  console.log(args)
}
</script>
<style lang="scss" scoped>
@import '../../assets/page.scss';
</style>

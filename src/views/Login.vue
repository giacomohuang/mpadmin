<template>
  <div class="login-container">
    <a-form ref="loginForm" :model="loginData" autocomplete="true" @finish="handleLogin" @finishFailed="handleFailed" class="login-form" auto-complete="on" laba-width="80px" laba-position="right">
      <h3 class="title">系统登录</h3>
      <a-form-item label="账号" name="userName" :rules="[{ required: true, message: 'Please input your username!' }]">
        <a-input v-model:value="loginData.userName" />
        <!-- placeholder="请填写用于登录的邮箱" -->
      </a-form-item>
      <a-form-item label="密码" name="password" :rules="[{ required: true, message: 'Please input your password!' }]">
        <a-input-password v-model:value="loginData.password" />
        <!-- placeholder="密码" -->
      </a-form-item>
      <a-form-item>
        <a-button type="primary" :disabled="disabled" html-type="submit">登录</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
const loginData = reactive({
  userName: '',
  password: '',
  remember: true
})

const disabled = computed(() => {
  return !(loginData.userName && loginData.password)
})

const handleLogin = (values) => {
  console.log(values)
  // this.$refs.loginForm.validate((valid) => {
  //   if (valid) {
  //     this.loading = true
  //     this.$store
  //       .dispatch('LoginByAccountName', this.loginForm)
  //       .then(() => {
  //         if (this.$store.state.account.token) {
  //           this.$router.push({ path: '/' })
  //         } else {
  //           this.$message({ message: '用户名密码错误', type: 'error' })
  //         }
  //         this.loading = false
  //         // this.showDialog = true
  //       })
  //       .catch(() => {
  //         this.loading = false
  //       })
  //   } else {
  //     console.log('error submit!!')
  //     return false
  //   }
  // })
}

const handleFailed = (errorInfo) => {
  console.log(errorInfo)
}
</script>

<style lang="scss" scoped>
.login-container {
  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;
  }

  .title {
    font-size: 26px;
    font-weight: 400;
    color: black;
    margin: 0px auto 20px auto;
    text-align: center;
    font-weight: bold;
  }

  .login-form {
    width: 400px;
    padding: 35px;
    margin: 120px auto;
    border: 1px solid #eaeefb;
    border-radius: 4px;
    transition: 0.2s;
    &:hover {
      box-shadow:
        0 0 8px 0 rgba(232, 237, 250, 0.6),
        0 2px 4px 0 rgba(232, 237, 250, 0.5);
    }
  }
}
</style>

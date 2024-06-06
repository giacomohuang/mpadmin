<template>
  <div class="main-wrap">
    <a-form ref="loginForm" :model="loginData" @finish="handleLogin" @finishFailed="handleFailed" class="form" auto-complete="on" laba-width="80px" laba-position="right">
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
        <a-button type="primary" html-type="submit">登录</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import { reactive, computed, onMounted, nextTick } from 'vue'
import { router } from '../router/router'

const loginData = reactive({
  userName: '',
  password: ''
})

const handleLogin = (values) => {
  console.log('Success:', values)
  router.push('/')
}

const handleFailed = (errorInfo) => {
  console.log(errorInfo)
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
  display: flex;
  padding-top: 120px;
  justify-content: center;
  // background:
  background-color: var(--bg-main);
  // background-image: url(../assets/bg.webp);
  // /* 背景图垂直、水平均居中 */
  // background-position: center center;
  // /* 背景图不平铺 */
  // background-repeat: no-repeat;
  // /* 当内容高度大于图片高度时，背景图像的位置相对于viewport固定 */
  // background-attachment: fixed;
  // /* 让背景图基于容器大小伸缩 */
  // background-size: cover;
  // /* 设置背景颜色，背景图加载过程中会显示背景色 */
}

.title {
  font-size: 26px;
  font-weight: 400;
  color: var(--c-text-main);
  margin: 0px auto 20px auto;
  text-align: center;
  font-weight: bold;
}

.form {
  display: block;
  width: 500px;
  padding: 40px;
  background: var(--bg-layout);
  // background-color: rgba(255, 255, 255, 0.2); /* 半透明背景 */
  // backdrop-filter: blur(10px); /* 背景模糊 */
  // -webkit-backdrop-filter: blur(10px); /* 兼容老版本 Safari */
  border: 1px solid var(--color-border);
  border-radius: 4px;
  transition: 0.2s;
  &:hover {
    box-shadow: 0 0 8px 0 var(--color-shadow);
  }
}
</style>

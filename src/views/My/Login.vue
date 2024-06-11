<template>
  <div class="main-wrap radial-gradient">
    <header>
      <div class="logo"><img src="@/assets/logo.png" width="24" /></div>
      <div class="app-name">{{ $t('appname') }}</div>
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
        <Icon name="theme-light" size="2em" class="icon" @click="gobalTheme.changeMode('light')" :class="{ active1: gobalTheme.mode === 'light' }"></Icon>
        <Icon name="theme-dark" size="2em" class="icon" @click="gobalTheme.changeMode('dark')" :class="{ active2: gobalTheme.mode === 'dark' }"></Icon>
        <Icon name="theme-system" size="2em" class="icon" @click="gobalTheme.changeMode('system')" :class="{ active3: gobalTheme.mode === 'system' }"></Icon>
      </div>
    </header>
    <a-form ref="loginForm" :model="loginData" @finish="handleLogin" @finishFailed="handleFailed" class="form" auto-complete="on" laba-width="80px" laba-position="right">
      <h3 class="title">{{ $t('route.login') }}</h3>
      <a-form-item style="align-items: center" label="账号" name="username" :rules="[{ required: true, message: 'Please input your username!' }]">
        <a-input size="large" large v-model:value="loginData.username" />
        <!-- placeholder="请填写用于登录的邮箱" -->
      </a-form-item>
      <a-form-item style="align-items: center" label="密码" name="password" :rules="[{ required: true, message: 'Please input your password!' }]">
        <a-input-password size="large" v-model:value="loginData.password" />
        <!-- placeholder="密码" -->
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">登录</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { router } from '@/router/router'
import { changeLocale } from '@/i18n'
import { useTheme } from '@/stores/theme'
import { user as userAPI } from '@/api/user'

const loginData = reactive({
  username: '',
  password: ''
})

const handleLogin = async (values) => {
  console.log('Success:', values)
  let data = await userAPI.login(values)
  if (data.code=='200') {
    localStorage.setItem("accessToken",data.accessToken)
    router.push('/')
  }
}

const handleFailed = (errorInfo) => {
  console.log(errorInfo)
}

const gobalTheme = useTheme()
console.log(gobalTheme.mode)

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

header {
  display: flex;
  flex-direction: row;
  position: absolute;
  align-items: center;
  padding: 0 12px;
  height: 64px;
  width: 100%;
  min-width: 1000px;
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
  color: var(--text-secondary);
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

.form {
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

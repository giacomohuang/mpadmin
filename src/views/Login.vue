<template>
  <div class="login-container">
    <el-form ref="loginForm" :model="loginForm" :rules="rules" class="login-form" auto-complete="on" label-width="80px" label-position="right">
      <h3 class="title">系统登录</h3>
      <el-form-item label="账号" prop="accountname">
        <el-input v-model="loginForm.accountname" auto-complete="on" placeholder="请填写用于登录的邮箱" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="loginForm.password" :type="pwdType" auto-complete="on" placeholder="密码" @keyup.enter="handleLogin" />
        <!-- <div class="show-pwd">显示密码</div> -->
      </el-form-item>
      <el-form-item>
        <el-button :loading="loading" type="primary" @click.prevent="handleLogin">登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
// import { getPermission } from '@/api/account'
// import { isvalidUsername } from '@/utils/validate'
export default {
  data() {
    // const validateUsername = (rule, value, callback) => {
    //   if (!isvalidUsername(value)) {
    //     callback(new Error('请输入正确的用户名'))
    //   } else {
    //     callback()
    //   }
    // }
    // const validatePassword = (rule, value, callback) => {
    //   if (value.length < 6) {
    //     callback(new Error('密码不能小于6位'))
    //   } else {
    //     callback()
    //   }
    // }
    return {
      loginForm: {
        accountName: 'admin',
        password: ''
      },
      rules: {
        accountName: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '3-10位', trigger: 'blur' }
        ],
        password: [{ min: 6, trigger: 'blur', message: '请输入密码' }]
      },
      pwdType: 'password',
      loading: false,
      showDialog: false
    }
  },
  methods: {
    handleLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading = true
          this.$store
            .dispatch('LoginByAccountName', this.loginForm)
            .then(() => {
              if (this.$store.state.account.token) {
                this.$router.push({ path: '/' })
              } else {
                this.$message({ message: '用户名密码错误', type: 'error' })
              }
              this.loading = false
              // this.showDialog = true
            })
            .catch(() => {
              this.loading = false
            })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

.login-container {
  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
    &_login {
      font-size: 20px;
    }
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

  // .show-pwd {
  //   position: absolute;
  //   right: 10px;
  //   top: 0px;
  //   font-size: 16px;
  //   color: $dark_gray;
  //   cursor: pointer;
  // }
}
</style>

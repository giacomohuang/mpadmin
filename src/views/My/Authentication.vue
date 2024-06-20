<template>
  <div class="main">
    <section>
      <div class="title flex">
        <h2>密码</h2>
        <a-button @click.stop="status.toggleChangePwd = !status.toggleChangePwd">{{ status.toggleChangePwd ? $t('authentication.hide') : $t('authentication.changepwd') }}</a-button>
      </div>
      <div v-if="status.toggleChangePwd" class="content">
        <a-form :model="form" :label-col="{ span: 6 }" :wrapper-col="{ span: 12 }">
          <a-form-item label="旧密码">
            <a-input type="password" v-model:value="form.oldPassword" />
          </a-form-item>
          <a-form-item label="新密码">
            <a-input type="password" v-model:value="form.newPassword" />
          </a-form-item>
          <a-form-item label="确认新密码">
            <a-input type="password" v-model:value="form.comfirmPassword" />
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
const form = ref({})
const status = reactive({
  toggleChangePwd: false
})
</script>
<style lang="scss" scoped>
@import '../../assets/page.scss';
</style>

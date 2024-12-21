<script lang="ts" setup>
import {onMounted, reactive, ref} from 'vue'
import {ElMessage} from 'element-plus'
import {useRouter} from 'vue-router'
import {parseJwt} from '@/utils/jwt'
import {isSuccess} from '@/utils/responseHandle'
import {useUserStore} from "@/stores/user";
import {loginCall} from "@/api/auth";
import type {Login} from '@/types/auth'

// do not use same name with ref
const form = reactive<Login>({
  username: '',
  password: '',
})

const router = useRouter()
const userStore = useUserStore()

const login = () => {
  loginCall(form).then((response) => {
    if (isSuccess(response.data)) {
      const token = response.data.token
      if (!token) {
        ElMessage.error({message: 'Get token failed!'})
        return
      }
      userStore.token = token
      const userInfo = parseJwt(token)
      userStore.username = userInfo.username
      ElMessage.success({
        message: 'Login success!',
      })
      router.replace('/')
    } else {
      ElMessage.error({
        message: 'Login failed! Reason: ' + response.data.error_message,
      })
    }
  })

}
const onReset = () => {
  console.log("reset!")
}

const height = ref(800)
onMounted(() => {
  height.value = window.innerHeight / 2
})

</script>

<template>
  <el-row id="loginRow" justify="center" align="middle" :style="`height: ${height}px;`">
    <el-col :span="6">
      <el-form :model="form" label-width="auto" style="max-width: 600px;">
        <el-form-item label="用户名">
          <el-input v-model="form.username"/>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" show-password @keyup.enter="login"/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="login">登录</el-button>
          <el-button @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>

</template>

<style scoped></style>
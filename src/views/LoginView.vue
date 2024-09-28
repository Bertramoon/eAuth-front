<script lang="ts" setup>
import { onMounted, onUpdated, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import request from '@/utils/request'
import { parseJwt } from '@/utils/jwt'
import { errorHandle } from '@/utils/responseHandle'

// do not use same name with ref
const form = reactive({
    username: '',
    password: '',
})

const router = useRouter()

const onSubmit = () => {
    console.log('submit!')
    request.post("/auth/login", form).then((response) => {
        console.log(response);
        if (response.status == 200) {
            const token = response.data.token
            if (!token) {
                ElMessage.error({ message: 'Get token failed!' })
                return
            }
            sessionStorage.setItem("token", token)
            const userInfo = parseJwt(token)
            localStorage.setItem("username", userInfo.username)
            ElMessage.success({
                message: 'Login success!',
            })
            router.replace('/')
        } else {
            ElMessage.error({
                message: 'Login failed! Reason: ' + response.data.error_message,
            })
        }
    }).catch(function (error) {
        ElMessage.error({
            message: errorHandle(error.response.data, "Login failed!")
        })
    });

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
                    <el-input v-model="form.username" />
                </el-form-item>
                <el-form-item label="密码">
                    <el-input v-model="form.password" type="password" show-password />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="onSubmit">登录</el-button>
                    <el-button @click="onReset">重置</el-button>
                </el-form-item>
            </el-form>
        </el-col>
    </el-row>

</template>

<style scoped></style>
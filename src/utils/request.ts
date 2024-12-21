import axios from "axios"
import {ElMessage} from 'element-plus'

import router from '@/router'
import {errorHandle, isSuccess, type Response} from "@/utils/responseHandle";
import {useUserStore} from "@/stores/user"


// 创建一个 axios 接口
const request = axios.create({
    baseURL: import.meta.env.VITE_EAUTH_DOMAIN + '/api', 
    timeout: 10000, // 请求超时时间设置
})

//添加请求拦截器
request.interceptors.request.use(config => {
    const userStore = useUserStore()
    if (userStore.token) {
        config.headers.Authorization = userStore.token
    } else {
        router.replace("/login")
    }
    return config
}, error => {
    return Promise.reject(error);
})

request.interceptors.response.use(response => {
    const res: Response<any> = response.data
    if (!isSuccess(response.data)) {
        ElMessage.error({
            message: errorHandle(res, "An error occurred")
        })
    }
    return response
}, error => {
    if (error.response.status === 401) {
        router.replace("/login")
    }
    if (error.response.status === 403) {
        ElMessage.error({
            message: "无权限！"
        })
    }
    if (error.response.status === 422) {
        ElMessage.error({
            message: errorHandle(error.response.data, "An error occurred")
        })
    }
    return Promise.reject(error);
})

export default request
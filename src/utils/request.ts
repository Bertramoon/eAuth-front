import axios from "axios"
import { ElMessage } from 'element-plus'

import router from '@/router'


// 创建一个 axios 接口
const request = axios.create({
    baseURL: import.meta.env.VITE_EAUTH_DOMAIN + '/api', 
    timeout: 5000, // 请求超时时间设置
})

//添加请求拦截器
request.interceptors.request.use(config => {
    if (sessionStorage.getItem('token')) {
        config.headers.Authorization = sessionStorage.getItem('token')
    }
    return config
}, error => {
    return Promise.reject(error);
})

request.interceptors.response.use(response => {
    return response
}, error => {
    if (error.response.status === 401) {
        sessionStorage.clear()
        router.replace("/login")
    }
    if (error.response.status === 403) {
        ElMessage.error({
            message: "无权限！"
        })
    }
    return Promise.reject(error);
})

export default request
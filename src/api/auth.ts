import request from "@/utils/request";
import type {Login} from "@/types/auth";

export const loginCall = (body: Login) => {
    return request.post('/auth/login', body)
}

export const logoutCall = () => {
    return request.post('/auth/logout')
}
import request from '@/utils/request'
import type {IdList} from '@/types'
import {pickNonEmptyAttributes} from "@/utils/convert";
import type {RoleQuery} from "@/types/role";
import type {ChangePassword, UserQuery, UserRegister, UserReset, UserUpdate} from "@/types/user";

export const userPasswordChangeCall = (data: ChangePassword) => {
    return request.post('/config/user/change-password', pickNonEmptyAttributes(data))
}
export const queryUserCall = (params: UserQuery) => {
    return request.get('/config/user', {params: pickNonEmptyAttributes(params)})
}
export const updateUserCall = (uid: number, user: UserUpdate) => {
    return request.put(`/config/user/${uid}`, user)
}
export const userGrantCall = (uid: number, roleIds: IdList) => {
    return request.post(`/config/user/${uid}/role`, roleIds)
}
export const getLightRolesCall = () => {
    return request.get(`/config/user/roles`)
}
export const userRegisterCall = (userRegister: UserRegister) => {
    return request.post("/config/user/register", userRegister)
}
export const userResetCall = (userReset: UserReset) => {
    return request.post("/config/user/reset", userReset)
}
export const queryUserBoundRolesCall = (uid: number, params: RoleQuery) => {
    return request.get(`/config/user/${uid}/bound-roles`, {params: pickNonEmptyAttributes(params)})
}

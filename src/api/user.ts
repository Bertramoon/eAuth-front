import request from '@/utils/request'
import type { ChangePassword, IdList, UserQuery, UserRegister, UserReset, UserUpdate } from '@/types'

export const logoutPost = () => { return request.post('/auth/logout') }
export const userPasswordChange = (data: ChangePassword) => { return request.post('/config/user/change-password', data) }
export const userGet = (params: UserQuery) => { return request.get('/config/user', { params: params }) }
export const userUpdate = (uid: number, user: UserUpdate) => { return request.put(`/config/user/${uid}`, user) }
export const userGrant = (uid: number, roleIds: IdList) => { return request.post(`/config/user/${uid}/role`, roleIds) }
export const lightRolesGet = () => { return request.get(`/config/user/roles`) }
export const userRegister = (userRegister: UserRegister) => { return request.post("/config/user/register", userRegister) }
export const userReset = (userReset: UserReset) => { return request.post("/config/user/reset", userReset) }

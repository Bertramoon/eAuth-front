import request from '@/utils/request'
import {type IdList} from '@/types'
import {pickNonEmptyAttributes} from "@/utils/convert";
import type {ApiQuery} from "@/types/api";
import type {RoleInput, RoleQuery} from "@/types/role";
import type {UserQuery} from "@/types/user";


export const getRoleCall = (params: RoleQuery) => {
    return request.get('/config/role', {params: pickNonEmptyAttributes(params)})
}
export const createRoleCall = (role: RoleInput) => {
    return request.post('/config/role', role)
}
export const updateRoleCall = (roleId: number, role: RoleInput) => {
    return request.put(`/config/role/${roleId}`, role)
}
export const deleteRoleCall = (roleId: number) => {
    return request.delete(`/config/role/${roleId}`)
}
export const roleBindApisCall = (roleId: number, apis: IdList) => {
    return request.put(`/config/role/${roleId}/api`, apis)
}
export const roleUnbindApisCall = (roleId: number, apis: IdList) => {
    return request.delete(`/config/role/${roleId}/api`, {data: apis})
}
export const roleBindUsersCall = (roleId: number, users: IdList) => {
    return request.put(`/config/role/${roleId}/user`, users)
}
export const roleUnbindUsersCall = (roleId: number, users: IdList) => {
    return request.delete(`/config/role/${roleId}/user`, {data: users})
}
export const getRoleConditionsCall = () => {
    return request.get('/config/role/conditions')
}
export const queryRoleBoundApisCall = (roleId: number, params: ApiQuery) => {
    return request.get(`/config/role/${roleId}/bound-apis`, {params: pickNonEmptyAttributes(params)})
}
export const queryRoleUnboundApisCall = (roleId: number, params: ApiQuery) => {
    return request.get(`/config/role/${roleId}/unbound-apis`, {params: pickNonEmptyAttributes(params)})
}
export const queryRoleBoundUsersCall = (roleId: number, params: UserQuery) => {
    return request.get(`/config/role/${roleId}/bound-users`, {params: pickNonEmptyAttributes(params)})
}
export const queryRoleUnboundUsersCall = (roleId: number, params: UserQuery) => {
    return request.get(`/config/role/${roleId}/unbound-users`, {params: pickNonEmptyAttributes(params)})
}


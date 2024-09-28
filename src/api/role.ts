import request from '@/utils/request'
import { type RoleInput, type RoleQuery, type ApiQuery, type IdList } from '@/types'


export const getRole = (params: RoleQuery) => { return request.get('/config/role', { params: params }) }
export const createRole = (role: RoleInput) => { return request.post('/config/role', role) }
export const updateRole = (roleId: number, role: RoleInput) => { return request.put(`/config/role/${roleId}`, role) }
export const deleteRole = (roleId: number) => { return request.delete(`/config/role/${roleId}`) }
export const getRoleUnbindApi = (roleId: number, params: ApiQuery) => { return request.get(`/config/role/unbind/${roleId}`, { params: params }) }
export const roleBindApi = (roleId: number, apis: IdList) => { return request.put(`/config/role/${roleId}/api`, apis) }
export const roleUnbindApi = (roleId: number, apis: IdList) => { return request.delete(`/config/role/${roleId}/api`, { data: apis }) }

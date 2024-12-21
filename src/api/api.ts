import request from '@/utils/request'
import {type IdList} from '@/types'
import {pickNonEmptyAttributes} from "@/utils/convert";
import type {ApiInput, ApiQuery} from "@/types/api";
import type {RoleQuery} from "@/types/role";


export const queryApiCall = (params: ApiQuery) => {
    return request.get('/config/api', {params: pickNonEmptyAttributes(params)})
}
export const createApiCall = (api: ApiInput) => {
    return request.post('/config/api', api)
}
export const updateApiCall = (apiId: number, api: ApiInput) => {
    return request.put(`/config/api/${apiId}`, api)
}
export const deleteApiCall = (apiId: number) => {
    return request.delete(`/config/api/${apiId}`)
}
export const getApiConditionsCall = () => {
    return request.get('/config/api/conditions')
}
export const apiBindRolesCall = (apiId: number, roles: IdList) => {
    return request.put(`/config/api/${apiId}/role`, roles)
}
export const apiUnbindRolesCall = (apiId: number, roles: IdList) => {
    return request.delete(`/config/api/${apiId}/role`, {data: roles})
}
export const queryApiBoundRolesCall = (apiId: number, params: RoleQuery) => {
    return request.get(`/config/api/${apiId}/bound-roles`, {params: pickNonEmptyAttributes(params)})
}
export const queryApiUnboundRolesCall = (apiId: number, params: RoleQuery) => {
    return request.get(`/config/api/${apiId}/unbound-roles`, {params: pickNonEmptyAttributes(params)})
}
import request from '@/utils/request'
import { type ApiInput, type ApiQuery } from '@/types'


export const getApi = (params: ApiQuery) => { return request.get('/config/api', { params: params }) }
export const createApi = (api: ApiInput) => { return request.post('/config/api', api) }
export const updateApi = (apiId: number, api: ApiInput) => { return request.put(`/config/api/${apiId}`, api) }
export const deleteApi = (apiId: number) => { return request.delete(`/config/api/${apiId}`) }

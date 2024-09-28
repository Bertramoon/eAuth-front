import type { OperateLogQuery, SecurityLogQuery } from "@/types"
import request from "@/utils/request"


export const operateLogGet = (params: OperateLogQuery) => { return request.get('/log/operate-log', { params: params }) }
export const securityLogGet = (params: SecurityLogQuery) => { return request.get('/log/security-log', { params: params }) }

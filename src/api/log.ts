import request from "@/utils/request"
import type {OperateLogQuery, SecurityLogQuery} from "@/types/log";


export const operateLogCall = (params: OperateLogQuery) => {
    return request.get('/log/operate-log', {params: params})
}
export const securityLogCall = (params: SecurityLogQuery) => {
    return request.get('/log/security-log', {params: params})
}

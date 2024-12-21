import type {PageQuery} from "@/types/index";

export interface OperateLog {
    id: number,
    username: string,
    ip_addr: string,
    operate_type: string,
    operate_api: string,
    status_code: number,
    resource_id?: number,
    request_data?: string,
    response_data?: string,
    success: boolean,
    operate_datetime: Date
}

export interface OperateLogQuery extends Partial<Pick<OperateLog, 'username' | 'ip_addr' | 'operate_type' | 'operate_api' | 'status_code' | 'resource_id' | 'success'>>,
    PageQuery {
    start_datetime?: string,
    end_datetime?: string
}

export interface SecurityLog {
    id: number,
    username: string,
    ip_addr: string,
    operate: string,
    success: boolean,
    operate_datetime: Date
}

export interface SecurityLogQuery extends Partial<Pick<SecurityLog, 'username' | 'ip_addr' | 'operate' | 'success'>>,
    PageQuery {
    start_datetime?: string,
    end_datetime?: string
}
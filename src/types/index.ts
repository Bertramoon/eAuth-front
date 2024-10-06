export interface Api {
    id: number,
    url: string,
    method: string,
    description?: string,
    roles?: Array<Role>
}

export type ApiInput = Pick<Api, 'url' | 'method' | 'description'>

interface PageQuery {
    page?: number,
    per_page?: number
}

export interface ApiQuery extends PageQuery {
    search?: string,
    method?: string
}

export interface Role {
    id: number,
    name: string,
    description?: string,
    apis?: Array<Api>
}

export type RoleInput = Pick<Role, 'name' | 'description'>

export interface RoleQuery extends PageQuery {
    search?: string
}

export interface IdList {
    ids: Array<number>
}

export interface ChangePassword {
    password: string,
    new_password: string,
    new_password_confirm: string
}

export interface UserQuery extends PageQuery {
    username?: string
}

export interface User {
    id: number,
    username: string,
    email: string,
    locked: boolean,
    roles?: Array<Role>
}

export type UserRegister = Pick<User, 'username' | 'email'>
export type UserUpdate = Pick<User, 'email' | 'locked'>
export type UserReset = Pick<User, 'email'>

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

export interface OperateLogQuery extends
    Partial<Pick<OperateLog, 'username' | 'ip_addr' | 'operate_type' | 'operate_api' | 'status_code' | 'resource_id' | 'success'>>,
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

export interface SecurityLogQuery extends
    Partial<Pick<SecurityLog, 'username' | 'ip_addr' | 'operate' | 'success'>>,
    PageQuery {
    start_datetime?: string,
    end_datetime?: string
}

import type {PageQuery} from "@/types/index";

export interface RoleConditions {
    services: Array<string>
}

export interface Role {
    id: number,
    name: string,
    description?: string,
    service?: string
}

export type RoleInput = Pick<Role, 'name' | 'description' | 'service'>
export type RoleLight = Pick<Role, 'id' | 'name' | 'service'>

export interface RoleQuery extends PageQuery {
    search?: string,
    service?: string
}
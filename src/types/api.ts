import type {Role} from "@/types/role";
import type {PageQuery} from "@/types/index";

export interface ApiConditions {
    services: Array<string>
}

export interface Api {
    id: number,
    url: string,
    method: string,
    service?: string,
    description?: string,
    roles?: Array<Role>
}

export type ApiInput = Pick<Api, 'url' | 'method' | 'service' | 'description'>

export interface ApiQuery extends PageQuery {
    search?: string,
    method?: string,
    service?: string
}
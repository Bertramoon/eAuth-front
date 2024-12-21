import type {PageQuery} from "@/types/index";

export interface ChangePassword {
    password: string,
    new_password: string,
    new_password_confirm: string
}

export interface UserQuery extends PageQuery {
    search?: string
}

export interface User {
    id: number,
    username: string,
    email: string,
    locked: boolean
}

export type UserRegister = Pick<User, 'username' | 'email'>
export type UserUpdate = Pick<User, 'email' | 'locked'>
export type UserReset = Pick<User, 'email'>
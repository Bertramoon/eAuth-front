
interface pagination {
    current: string,
    first: string,
    last: string,
    next: string,
    page: number,
    pages: number,
    per_page: number,
    prev: string,
    total: number
}

export interface Response<T> {
    success: boolean,
    data: T,
    pagination?: pagination,
    error_message?: string,
    detail?: JSON
}


export const errorHandle = (res: Response<any>, message?: string) => {
    let error_message = "Reason: " + res.error_message
    if (res.detail) {
        error_message += ". Details: " + JSON.stringify(res.detail)
    }
    return message ? message + " " + error_message : error_message
}

export const isSuccess = (res: Response<any>) => {
    return res.success
}

interface Response {
    success: boolean,
    data?: Array<any>,
    pagination?: JSON,
    error_message?: string,
    detail?: JSON
}


export const errorHandle = (res: Response, message?: string) => {
    let error_message = "Reason: " + res.error_message
    if (res.detail) {
        error_message += ". Details: " + JSON.stringify(res.detail)
    }
    return message ? message + " " + error_message : error_message
}
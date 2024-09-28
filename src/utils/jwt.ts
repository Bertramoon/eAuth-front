export function parseJwt(token: string) {
    // 分割JWT的三个部分
    const split = token.split('.');
    if (split.length < 1) return null
    // 将Base64URL编码的载荷部分解码
    let base64 = split[1].replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
 
    // 解析载荷部分并返回
    return JSON.parse(jsonPayload);
}
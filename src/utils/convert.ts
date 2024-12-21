export const pickNonEmptyAttributes = (obj: any) => {
    return Object.keys(obj)
        .filter(key => obj[key] !== null && obj[key] !== undefined && obj[key] !== '')
        .reduce((result: any, key) => {
            result[key] = obj[key];
            return result;
        }, {});
}
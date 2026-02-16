export const callBX24Method = (method, params) => {
    return new Promise((resolve, reject) => {
        BX24.callMethod(method, params, (result) => {
            if (result.error()) {
                reject(result.error());
            } else {
                resolve(result.data());
            }
        });
    });
};
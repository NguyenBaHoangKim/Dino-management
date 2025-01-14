export const setCookie = (res, name, value, options = {}) => {
    res.cookie(name, value, options)
}

export const getCookie = (req, name) => {
    return req.cookies[name]
}

export const deleteCookie = (res, name, options = {}) => {
    res.clearCookie(name, options)
}
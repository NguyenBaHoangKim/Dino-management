import { promisify } from 'node:util'
import httpStatus from 'http-status'
import passport from 'passport'
import APIError from '#exceptions/api'
import User from '#models/user'

export const ADMIN = 'admin'
export const LOGGED_USER = '_loggedUser'

const handleJWT = (req, res, next, roles) => async (err, user, info) => {
    const logIn = promisify(req.logIn)
    const error = err || info
    const apiError = new APIError({
        message: error ? error.message : 'Unauthorized',
        status: httpStatus.UNAUTHORIZED,
        stack: error ? error.stack : undefined,
    })

    try {
        if (error || !user) {
            if (error.name === 'TokenExpiredError') {
                apiError.message = 'Token has expired'
            }
            throw error
        }
        await logIn(user, { session: false })
    } catch (e) {
        return next(apiError)
    }

    if (roles === LOGGED_USER) {
        console.log(user)
        
        if (user.role !== ADMIN && req.params.id !== user._id.toString()) {
            apiError.status = httpStatus.FORBIDDEN
            apiError.message = 'Forbidden'
            return next(apiError)
        }
    } else if (!roles.includes(user.role)) {
        apiError.status = httpStatus.FORBIDDEN
        apiError.message = 'Forbidden'
        return next(apiError)
    } else if (err || !user) {
        return next(apiError)
    }

    req.user = user

    return next()
}

export function authorize(roles = User.roles) {
    return (...params) =>
        passport.authenticate('jwt', { session: false }, handleJWT(...params, roles))(...params)
}

export function oAuth(service) {
    return passport.authenticate(service, { session: false })
}
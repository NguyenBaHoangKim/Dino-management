import Joi from 'joi'

// POST /api/auth/register
export const register = {
    body: {
        email: Joi.string().email().required(),
        password: Joi.string().required().min(6).max(128),
    },
}

// POST /api/auth/login
export const login = {
    body: {
        email: Joi.string().email().required(),
        password: Joi.string().required().max(128),
    },
}


// POST /api/auth/refresh-token
export const refreshToken = {
    body: {
        email: Joi.string().email().required(),
        refreshToken: Joi.string().required(),
    },
}

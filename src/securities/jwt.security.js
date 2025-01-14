import jwt from 'jsonwebtoken'
import config from '#configs/environment'
import { getCookie, setCookie } from '#utils/cookie'
import { getUnixTime } from 'date-fns'
import { JWT_CONSTANTS } from '#constants/index'
import httpStatus from 'http-status'

const { jwtSecret, jwtAccessExpiration, jwtRefreshExpiration } = config.auth

export const generateAccessToken = (res, user) => {
    const payload = {
        _id: user._id,
        role: user.role,
        iat: getUnixTime(Date.now()),
    }

    const token = jwt.sign(payload, jwtSecret, { expiresIn: jwtAccessExpiration })

    console.log('han access token', jwtAccessExpiration)

    setCookie(res, JWT_CONSTANTS.COOKIE_ACCESS_TOKEN, token,
        {
            maxAge: jwtAccessExpiration,
            httpOnly: true,
            path: '/',
            secure: true,
            sameSite: 'None',
        },
    )

    res.setHeader('Authorization', `Bearer ${token}`)
    res.setHeader(JWT_CONSTANTS.HEADER_ACCESS_TOKEN, token)

    return token
}

export const generateRefreshToken = (res, user) => {
    const payload = {
        _id: user._id,
        role: user.role,
        iat: getUnixTime(Date.now()),
    }

    const token = jwt.sign(payload, jwtSecret, { expiresIn: jwtRefreshExpiration })
    console.log('han refresh token ' + jwtRefreshExpiration)
    setCookie(res, JWT_CONSTANTS.COOKIE_REFRESH_TOKEN, token,
        {
            maxAge: jwtRefreshExpiration,
            httpOnly: true,
            path: '/',
            secure: true,
            sameSite: 'None',
        },
    )

    res.setHeader(JWT_CONSTANTS.HEADER_REFRESH_TOKEN, token)

    return token
}

export const getUserByToken = (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
        return res.status(httpStatus.UNAUTHORIZED).json({
            message: 'Không có token trong yêu cầu',
        })
    }

    return jwt.verify(token, jwtSecret)
}

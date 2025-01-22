import APIError from '#exceptions/api'
import httpStatus from 'http-status'
import {
    generateAccessToken,
    generateRefreshToken,
    getUserByToken,
} from '#securities/jwt'
import User from '#models/user'
import jwt from 'jsonwebtoken'
import config from '#configs/environment'
import { deleteCookie, getCookie } from '#utils/cookie'
import { JWT_CONSTANTS } from '#constants/index'
import { generatePasswordResetToken } from '#utils/token'
import * as emailService from '#services/email/email'
import Session from '#models/session'
import { getSocketInstance } from '#configs/socket'

const { jwtSecret } = config.auth

export const login = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email })

        if (!user || !(await user.passwordMatches(req.body.password))) {
            throw new APIError({
                message: 'Tên đăng nhập hoặc mật khẩu không đúng',
                // @ts-ignore
                status: httpStatus.UNAUTHORIZED,
            })
        }

        const accessToken = generateAccessToken(res, user)
        const refreshToken = generateRefreshToken(res, user)

        await User.findByIdAndUpdate(
            user._id,
            {
                accessToken: accessToken,
                refreshToken: refreshToken,
            },
            {
                new: true,
            },
        )

        const newSession = new Session({
            user_id: user._id,
            ip_address: req.ip,
            user_agent: req.headers['user-agent'],
            data: accessToken,
            last_activity: new Date(),
        })

        await newSession.save()

        //goi ntn la thanh cong roi
        // const io = getSocketInstance()
        // io.emit('newSession', "helloooooooo login success")

        return res.status(httpStatus.OK).json({
            message: 'Đăng nhập thành công',
            data: user.transform(),
            accessToken: accessToken,
        })
    } catch (e) {
        return res.status(e.status || httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Đăng nhập thất bại',
        })
    }
}

export const register = async (req, res) => {
    try {
        const user = await new User({
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
            role: 'user',
        }).save()

        return res.status(httpStatus.CREATED).json({
            data: user.transform(),
            message: 'Đăng ký thành công',
        })
    } catch (e) {
        return res.status(e.status || httpStatus.BAD_REQUEST).json({
            message: e.message || 'Đăng ký thất bại',
        })
    }
}

export const logout = async (req, res) => {
    try {
        const user = getUserByToken(req, res)

        await User.findByIdAndUpdate(
            user._id,
            {
                accessToken: '',
                refreshToken: '',
            },
            {
                new: true,
            },
        )

        res.removeHeader(JWT_CONSTANTS.HEADER_ACCESS_TOKEN)
        res.removeHeader(JWT_CONSTANTS.HEADER_REFRESH_TOKEN)
        deleteCookie(res, JWT_CONSTANTS.COOKIE_ACCESS_TOKEN)
        deleteCookie(res, JWT_CONSTANTS.COOKIE_REFRESH_TOKEN)

        return res.status(httpStatus.OK).json({
            message: 'Đăng xuất thành công',
        })
    } catch (e) {
        return res.status(e.status || httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Đăng xuất thất bại',
        })
    }
}

export const refreshToken = async (req, res) => {
    try {
        //const { refreshToken } = req.body
        const refreshToken = getCookie(req, JWT_CONSTANTS.COOKIE_REFRESH_TOKEN)
        console.log('refresh token', refreshToken)
        if (!refreshToken) {
            return res.status(httpStatus.BAD_REQUEST).json({
                message: 'Không thấy refresh token',
            })
        }

        const tokenRecord = await User.findOne({ refreshToken: refreshToken })

        if (!tokenRecord) {
            return res.status(httpStatus.UNAUTHORIZED).json({
                message: 'Refresh token không hợp lệ',
            })
        }

        jwt.verify(refreshToken, jwtSecret, async (err, user) => {
            if (err) {
                return res.status(httpStatus.UNAUTHORIZED).json({
                    message: 'Refresh token không hợp lệ',
                })
            }

            const accessToken = generateAccessToken(res, user)
            const refreshToken = generateRefreshToken(res, user)

            await User.findByIdAndUpdate(
                user._id,
                {
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                },
                {
                    new: true,
                },
            )

            return res.status(httpStatus.OK).json({
                data: {
                    accessToken: accessToken,
                },
                message: 'Làm mới token thành công',
            })
        })
    } catch (e) {
        return res.status(e.status || httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Làm mới token thất bại',
        })
    }
}

export const sendPasswordReset = async (req, res) => {
    try {

    } catch (e) {
        return res.status(e.status || httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Không thể gửi email',
        })
    }
}

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body
        const currentUser = getUserByToken(req, res)
        const user = await User.findById(currentUser._id)

        if (!user || !(await user.passwordMatches(currentPassword))) {
            return res.status(httpStatus.UNAUTHORIZED).json({
                message: 'Mật khẩu hiện tại không đúng',
            })
        }

        if (currentPassword === newPassword) {
            return res.status(httpStatus.BAD_REQUEST).json({
                message: 'Mật khẩu mới phải khác mật khẩu hiện tại',
            })
        }

        user.password = newPassword
        await user.save()

        return res.status(httpStatus.OK).json({
            message: 'Thay đổi mật khẩu thành công',
        })
    } catch (e) {
        return res.status(e.status || httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Không thể thay đổi mật khẩu',
        })
    }
}

export const oAuth = async (req, res) => {
    const { user } = req
    const accessToken = generateAccessToken(res, user)
    const refreshToken = generateRefreshToken(res, user)
    await User.findByIdAndUpdate(
        user._id,
        {
            accessToken: accessToken,
            refreshToken: refreshToken,
        },
        {
            new: true,
        },
    )
    const newSession = new Session({
        user_id: user._id,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        data: accessToken,
        last_activity: new Date(),
    })
    await newSession.save()
    return res.status(httpStatus.OK).json({
        message: 'Đăng nhập thành công',
        data: user.transform(),
    })
}


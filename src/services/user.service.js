import httpStatus from 'http-status'
import User from '#models/user'
import { getUserByToken } from '../securities/jwt.security.js'
import { uploadImage } from '../utils/github.util.js'

export const getUserById = async (req, res, id) => {
    try {
        const user = await User.findById(id)

        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Người dùng không tồn tại hoặc đã bị xóa',
            })
        }

        return res.status(httpStatus.OK).json({
            data: user.transform(),
            message: 'Lấy người dùng thành công',
        })
    } catch (e) {
        return res.status(e.status || httpStatus.NOT_FOUND).json({
            message: e.message || 'Không thể tìm thấy người dùng',
        })
    }
}

export const getCurrentUser = async (req, res) => {
    try {
        const user = getUserByToken(req, res)

        await getUserById(req, res, user._id)
    } catch (e) {
        return res.status(e.status || httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Không thể lấy thông tin người dùng',
        })
    }
}

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()

        return res.status(httpStatus.OK).json({
            //data: users.map((user) => user.transform()),
            data: users,
            message: 'Lấy tất cả người dùng thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Không thể lấy danh sách người dùng',
        })
    }
}

export const editUser = async (req, res) => {
    try {
        const userId = req.params.id
        const { username, birthday } = req.body

        const imageUrl = await uploadImage(req, res, 'avatar')

        const updateUser = await User.findByIdAndUpdate(
            userId, {
                username: username,
                avatar: imageUrl,
                birthday: birthday,
            },
            { new: true },
        )

        if (!updateUser) {
            throw new Error('User không tìm thấy')
        }

        return res.status(httpStatus.OK).json({
            data: updateUser.transform(),
            message: 'Cập nhật user thành công',
        })
    } catch (e) {
        return res.status(e.status || httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Không thể cập nhật thông tin người dùng',
        })
    }
}
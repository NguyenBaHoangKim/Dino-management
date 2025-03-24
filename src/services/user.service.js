import httpStatus from 'http-status'
import User from '#models/user'
import { getUserByToken } from '../securities/jwt.security.js'
import { uploadImage } from '../utils/github.util.js'
import { ROLE } from '../enums/role.enum.js'
import mongoose from 'mongoose'

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
        const { userId ,username, birthday, phoneNumber } = req.body
        let updateData = { username, birthday, phoneNumber }

        if (req.file) {
            const imageUrl = await uploadImage(req, res, 'avatar')
            updateData.avatar = imageUrl
        }

        const updateUser = await User.findByIdAndUpdate(
            userId,
            updateData,
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

export const changeUserRole = async (req, res) => {
    try {
        const { userId, role } = req.body

        if (!Object.values(ROLE).includes(role)) {
            return res.status(httpStatus.BAD_REQUEST).json({
                message: 'Role không hợp lệ',
            })
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { role: role },
            { new: true }
        )

        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'User không tìm thấy',
            })
        }

        return res.status(httpStatus.OK).json({
            data: user.transform(),
            message: 'Cập nhật role thành công',
        })
    } catch (e) {
        return res.status(e.status || httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Không thể cập nhật role người dùng',
        })
    }
}

//find student using name or email or id
export const findUser = async (req, res) => {
    try {
        const { search } = req.query

        // Assuming you have a Student model
        const searchQuery = {
            $or: [
                { username: { $regex: search, $options: 'i' } }, // Tìm theo username
                { email: { $regex: search, $options: 'i' } },    // Tìm theo email
            ],
        };

        // Nếu search là một ObjectId hợp lệ, thêm điều kiện tìm kiếm theo _id
        if (mongoose.Types.ObjectId.isValid(search)) {
            searchQuery.$or.push({ _id: search });
        }
        const students = await User.find(searchQuery)

        const transformedStudents = students.map((student) => student.transform())

        return res.status(httpStatus.OK).json({
            data: transformedStudents,
            message: 'Find students successfully',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Failed to find student',
        })
    }
}
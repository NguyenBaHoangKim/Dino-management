import Assignment from '#models/assignment'
import httpStatus from 'http-status'

export const createAssignment = async (req, res) => {
    try {
        const assignment = new Assignment(req.body)
        await assignment.save()
        return res.status(httpStatus.CREATED).json({
            data: assignment,
            message: 'Tạo bài tập thành công',
        })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Không thể tạo bài tập',
        })
    }
}

export const getAllAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find()
        return res.status(httpStatus.OK).json({
            data: assignments,
        })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Không thể lấy danh sách bài tập',
        })
    }
}

export const getAssignmentById = async (req, res) => {
    try {
        const { id } = req.params
        const assignment = await Assignment.findById(id)
        if (!assignment) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy bài tập',
            })
        }
        return res.status(httpStatus.OK).json({
            data: assignment,
        })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Không thể lấy bài tập',
        })
    }
}

export const updateAssignment = async (req, res) => {
    try {
        const { id } = req.params
        const assignment = await Assignment.findByIdAndUpdate(id, req.body, { new: true })
        if (!assignment) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy bài tập',
            })
        }
        return res.status(httpStatus.OK).json({
            data: assignment,
            message: 'Cập nhật bài tập thành công',
        })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Không thể cập nhật bài tập',
        })
    }
}

export const deleteAssignment = async (req, res) => {
    try {
        const { id } = req.params
        const assignment = await Assignment.findByIdAndDelete(id)
        if (!assignment) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy bài tập',
            })
        }
        return res.status(httpStatus.OK).json({
            message: 'Xóa bài tập thành công',
        })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Không thể xóa bài tập',
        })
    }
}
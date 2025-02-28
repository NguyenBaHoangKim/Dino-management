import Exercise from '../models/exercise.model.js'
import httpStatus from 'http-status'

// Create a new exercise
export const createExercise = async (req, res) => {
    try {
        const { lesson_id, type, description, title, time } = req.body
        const exercise = new Exercise({
            lesson_id: lesson_id,
            type: type,
            description: description,
            title: title,
            time: time,
        })
        await exercise.save()
        return res.status(httpStatus.CREATED).json({
            data: exercise,
            message: 'Tạo bài tập thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Tạo bài tập thất bại',
        })
    }
}

// Get an exercise by ID
export const getExerciseById = async (req, res) => {
    try {
        const exerciseId = req.params
        const exercise = await Exercise.findById(exerciseId)

        if (!exercise) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy bài tập',
            })
        }

        return res.status(httpStatus.OK).json({
            data: exercise,
            message: 'Lấy bài tập thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Lấy bài tập thất bại',
        })
    }
}

// Update an exercise by ID
export const updateExercise = async (req, res) => {
    try {
        const exerciseId = req.params.exerciseId
        const { type, description, title, time } = req.body
        const exercise = await Exercise.findByIdAndUpdate(exerciseId, {
            type: type,
            description: description,
            title: title,
            time: time,
        }, { new: true })

        if (!exercise) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy bài tập',
            })
        }

        return res.status(httpStatus.OK).json({
            data: exercise,
            message: 'Cập nhật bài tập thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Cập nhật bài tập thất bại',
        })
    }
}

// Delete an exercise by ID
export const deleteExercise = async (req, res) => {
    try {
        const exerciseId = req.params.exerciseId
        const exercise = await Exercise.findByIdAndDelete(exerciseId)

        if (!exercise) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy bài tập',
            })
        }

        return res.status(httpStatus.OK).json({
            data: exercise,
            message: 'Xóa bài tập thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Xóa bài tập thất bại',
        })
    }
}

// Get all exercises
export const getAllExercises = async (req, res) => {
    try {
        const exercises = await Exercise.find()

        return res.status(httpStatus.OK).json({
            data: exercises,
            message: 'Lấy tất cả bài tập thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Lấy tất cả bài tập thất bại',
        })
    }
}
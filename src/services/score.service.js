import Score from '#models/score.model'
import httpStatus from 'http-status'

export const createScore = async (req, res) => {
    try {
        const { userId, exerciseId, lessonId, score } = req.body

        const newScore = new Score({
            user_id: userId,
            exercise_id: exerciseId,
            lesson_id: lessonId,
            score: score,
        })

        await newScore.save()

        return res.status(httpStatus.CREATED).json({
            data: newScore,
            message: 'Tạo điểm số thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Tạo điểm số thất bại',
        })
    }
}

export const getScore = async (req, res) => {
    try {
        const score = await Score.find()

        if (!score) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy điểm số',
            })
        }

        return res.status(httpStatus.OK).json({
            data: score,
            message: 'Lấy điểm số thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Lấy điểm số thất bại',
        })
    }
}

export const getScoreByUserIdAndLessonId = async (req, res) => {
    try {
        const { userId, lessonId } = req.params

        const score = await Score.find({
            user_id: userId,
            lesson_id: lessonId,
        })

        if (!score) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy điểm số',
            })
        }

        return res.status(httpStatus.OK).json({
            data: score,
            message: 'Lấy điểm số thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Lấy điểm số thất bại',
        })
    }
}
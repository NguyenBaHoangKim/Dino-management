import Score from '#models/score.model'
import httpStatus from 'http-status'

export const createScore = async (req, res) => {
    try {
        const { userId, exerciseId, lessonId, courseId, score } = req.body

        const newScore = new Score({
            user_id: userId,
            course_id: courseId,
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

export const getScoreByUserIdAndExerciseId = async (req, res) => {
    try {
        const { userId, exerciseId } = req.params

        const score = await Score.find({
            user_id: userId,
            exercise_id: exerciseId,
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
    }
    catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Lấy điểm số thất bại',
        })
    }
}

export const getAverageScoreByUserIdInLesson = async (req, res) => {
    try {
        const { userId, lessonId } = req.params
        const scores = await Score.find({
            user_id: userId,
            lesson_id: lessonId,
        })
        if (!scores) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy điểm số',
            })
        }
        let sum = 0
        scores.forEach((score) => {
            sum += score.score
        })
        const average = sum / scores.length
        return res.status(httpStatus.OK).json({
            data: average,
            message: 'Lấy điểm số trung bình thành công',
        })
    }
    catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Lấy điểm số trung bình thất bại',
        })
    }
}

//in exercise have many user so, we need to calculate average score of each user return list of user with average score
export const getListAverageScoreInExercise = async (req, res) => {
    try {
        const { exerciseId } = req.params
        const scores = await Score.find({exercise_id: exerciseId })
        if (!scores) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy điểm số',
            })
        }
        let userScore = {}
        scores.forEach((score) => {
            if (userScore[score.user_id]) {
                userScore[score.user_id].push(score.score)
            }
            else {
                userScore[score.user_id] = [score.score]
            }
        }
        )
        let listUserAverageScore = []
        for (let user in userScore) {
            let sum = 0
            userScore[user].forEach((score) => {
                sum += score
            })
            const average = sum / userScore[user].length
            listUserAverageScore.push({
                user_id: user,
                average_score: average,
            })
        }
        return res.status(httpStatus.OK).json({
            data: listUserAverageScore,
            message: 'Lấy điểm số trung bình thành công',
        })
    }
    catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Lấy điểm số trung bình thất bại',
        })
    }
}
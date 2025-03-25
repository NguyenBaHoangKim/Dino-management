import Score from '#models/score'
import httpStatus from 'http-status'
import Exercise from '../models/exercise.model.js'
import Lesson from '../models/lesson.model.js'

export const createScore = async (req, res) => {
    try {
        const { userId, exerciseId, score } = req.body

        const checkExistScore = await Score.findOne({user_id: userId, exercise_id: exerciseId})
        if (checkExistScore) {
            return res.status(httpStatus.BAD_REQUEST).json({
                message: 'Điểm số đã tồn tại',
            })
        }

        const exercise = await Exercise.findById(exerciseId)
        const lesson = await Lesson.findById(exercise.lesson_id)

        const newScore = new Score({
            user_id: userId,
            course_id: lesson.course_id,
            exercise_id: exerciseId,
            lesson_id: exercise.lesson_id,
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
export const getListAverageScoreInCourse = async (req, res) => {
    try {
        const { courseId } = req.params
        const scores = await Score.find({course_id: courseId })
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
            const average = (sum / userScore[user].length).toFixed(2)
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
import Score from '#models/score'
import httpStatus from 'http-status'
import Exercise from '../models/exercise.model.js'
import Lesson from '../models/lesson.model.js'
import Course from '../models/course.model.js'
import CourseMember from '../models/courseMember.model.js'
import Answer from '../models/answer.model.js'

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

export const editScore = async (req, res) => {
    try {
        const { scoreId } = req.params
        const { score } = req.body

        const updatedScore = await Score.findByIdAndUpdate(
            scoreId,
            { score: score },
            { new: true }
        )

        if (!updatedScore) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy điểm số',
            })
        }

        return res.status(httpStatus.OK).json({
            data: updatedScore,
            message: 'Cập nhật điểm số thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Cập nhật điểm số thất bại',
        })
    }
}

export const deleteScore = async (req, res) => {
    try {
        const { scoreId } = req.params

        const deletedScore = await Score.findByIdAndDelete(scoreId)

        if (!deletedScore) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy điểm số',
            })
        }

        const deleteAnswer = await Answer.deleteMany({ user_id: deletedScore.user_id, exercise_id: deletedScore.exercise_id})

        return res.status(httpStatus.OK).json({
            data: deletedScore,
            check: deleteAnswer,
            message: 'Xóa điểm số thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Xóa điểm số thất bại',
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

export const getScoreByExerciseId = async (req, res) => {
    try {
        const { exerciseId } = req.params

        const scores = await Score.find({
            exercise_id: exerciseId,
        }).populate('user_id', '_id username email avatar')


        const exercise = await Exercise.findById(exerciseId)
        const lesson = await Lesson.findById(exercise.lesson_id)
        const courseMember = await CourseMember.find({ course_id: lesson.course_id }).populate('user_id')

        const member = courseMember.map((member) => {
            const userScore = scores.find((score) => score.user_id._id.toString() === member.user_id._id.toString())
            return {
                user_id: member.user_id._id,
                username: member.user_id.username,
                email: member.user_id.email,
                score: userScore ? userScore.score : null,
            }
        })

        return res.status(httpStatus.OK).json({
            data: member,
            message: 'Lấy điểm số thành công',
        })
    }
    catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Lấy điểm số thất bại',
        })
    }
}

export const getAllScoreInCourse = async (req, res) => {
    try {
        const { courseId } = req.params

        // Find the course
        const course = await Course.findById(courseId)
        if (!course) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy khóa học',
            })
        }

        // Find all lessons in the course
        const lessons = await Lesson.find({ course_id: courseId })
        const courseMember = await CourseMember.find({ course_id: courseId }).populate('user_id')

        // Map lessons to include exercises and scores
        const lessonDetails = await Promise.all(
            lessons.map(async (lesson) => {
                const exercises = await Exercise.find({ lesson_id: lesson._id })

                const exerciseDetails = await Promise.all(
                    exercises.map(async (exercise) => {
                        const scores = await Score.find({ exercise_id: exercise._id }).populate('user_id', '_id username email avatar')

                        return {
                            //...exercise.toObject(),
                            title: exercise.title,
                            exercise_id: exercise._id,
                            member: courseMember.map((member) => {
                                const userScore = scores.find((score) => score.user_id._id.toString() === member.user_id._id.toString())
                                return {
                                    user_id: member.user_id._id,
                                    username: member.user_id.username,
                                    email: member.user_id.email,
                                    score: userScore ? userScore.score : null,
                                    scoreId: userScore ? userScore._id : null,
                                }
                            })
                        }
                    })
                )

                return {
                    //...lesson.toObject(),
                    title: lesson.title,
                    exercises: exerciseDetails,
                }
            })
        )

        // Structure the final response
        const courseDetails = {
            //...course.toObject(),
            title: course.title,
            lessons: lessonDetails,
        }

        return res.status(httpStatus.OK).json({
            data: courseDetails,
            message: 'Lấy thông tin khóa học thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Lấy thông tin khóa học thất bại',
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
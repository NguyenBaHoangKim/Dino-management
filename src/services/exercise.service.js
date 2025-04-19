import Exercise from '../models/exercise.model.js'
import httpStatus from 'http-status'
import Score from '../models/score.model.js'
import Answer from '../models/answer.model.js'
import { PAGE, PER_PAGE } from '#constants/index'
import Lesson from '../models/lesson.model.js'
import CourseMember from '../models/courseMember.model.js'
import Question from '../models/question.model.js'

// Create a new exercise
export const createExercise = async (req, res) => {
    try {
        const { lesson_id, type, description, title, time, end_date } = req.body
        const exercise = new Exercise({
            lesson_id: lesson_id,
            type: type,
            description: description,
            title: title,
            time: time,
            end_date: end_date,
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
        const exerciseId = req.params.exerciseId
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
        const { type, description, title, time, end_date } = req.body
        const exercise = await Exercise.findByIdAndUpdate(exerciseId, {
            type: type,
            description: description,
            title: title,
            time: time,
            end_date: end_date,
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

        // Delete all questions and answers related to the exercise
        await Question.deleteMany({ exercise_id: exerciseId })
        await Answer.deleteMany({ exercise_id: exerciseId })
        await Score.deleteMany({ exercise_id: exerciseId })

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
        let { page = PAGE, perPage = PER_PAGE } = req.query

        page = parseInt(page, 10)
        const skip = (page - 1) * perPage
        const limit = parseInt(perPage, 10)

        const exercises = await Exercise.find().skip(skip).limit(limit)
        const totalExercises = await Exercise.countDocuments()

        return res.status(httpStatus.OK).json({
            data: exercises,
            page: page,
            total: totalExercises,
            totalPages: Math.ceil(totalExercises / limit),
            message: 'Lấy tất cả bài tập thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Lấy tất cả bài tập thất bại',
        })
    }
}

export const removeExerciseResultUser = async (req, res) => {
    try {
        const { exerciseId, userId } = req.params

        const score = await Score.findOne({ user_id: userId, exercise_id: exerciseId })
        if (!score) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy kết quả bài tập',
            })
        }
        await score.remove()
        await Answer.deleteMany({ user_id: userId, exercise_id: exerciseId })

        return res.status(httpStatus.OK).json({
            data: score,
            message: 'Xóa kết quả bài tập thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Xóa kết quả bài tập thất bại',
        })
    }
}

export const getExerciseByLessonIdForStudent = async (req, res) => {
    try {
        const { lessonId, userId } = req.params
        const exercises = await Exercise.find({ lesson_id: lessonId })

        if (!exercises) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy bài tập',
            })
        }

        const exercisesWithScores = await Promise.all(
            exercises.map(async (exercise) => {
                const score = await Score.findOne({ user_id: userId, exercise_id: exercise._id });
                const countQuiz = await Question.countDocuments({ exercise_id: exercise._id });
                return {
                    ...exercise.toObject(),
                    countQuiz: countQuiz,
                    score: score ? score.score : null,
                };
            })
        );

        return res.status(httpStatus.OK).json({
            data: exercisesWithScores,
            message: 'Lấy bài tập theo lesson cho hoc sinh thành công',
        });
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Lấy bài tập theo lesson thất bại',
        })
    }
}

export const getExerciseByLessonIdForTeacher = async (req, res) => {
    try {
        const { lessonId } = req.params

        const lesson = await Lesson.findById(lessonId)
        const exercises = await Exercise.find({ lesson_id: lessonId })

        if (!exercises) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy bài tập',
            })
        }

        const userInCourse = await CourseMember.countDocuments({ course_id: lesson.course_id })

        const exercisesWithProcess = await Promise.all(
            exercises.map(async (exercise) => {
                const userSubmit = await Score.countDocuments({ exercise_id: exercise._id })
                return {
                    ...exercise.toObject(),
                    userSubmited: userSubmit,
                    userInCourse: userInCourse,
                    process: Math.ceil((userSubmit / userInCourse) * 100 * 100) / 100,
                };
            })
        );

        return res.status(httpStatus.OK).json({
            data: exercisesWithProcess,
            message: 'Lấy bài tập theo lesson cho giao vien thành công',
        });
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Lấy bài tập theo lesson thất bại',
        })
    }
}

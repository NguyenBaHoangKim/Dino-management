import { PAGE, PER_PAGE } from '#constants/index'
import Lesson from '#models/lesson'
import { uploadImage } from '#utils/github'
import httpStatus from 'http-status'
import Exercise from '../models/exercise.model.js'
import Score from '../models/score.model.js'
import Answer from '../models/answer.model.js'
import Question from '../models/question.model.js'

export const createLessonByCourseId = async (req, res) => {
    try {
        const { courseId } = req.params
        const { title, description, videoUrl, body, status } = req.body
        let imageUrl = undefined
        if (req.file) {
            imageUrl = await uploadImage(req, res, 'lessons')
        }
        const newLesson = new Lesson({
            title: title,
            description: description,
            video_url: videoUrl,
            images: imageUrl,
            body: body,
            status: status,
            course_id: courseId,
        })

        const savedLesson = await newLesson.save()

        return res.status(httpStatus.CREATED).json({
            data: savedLesson,
            message: 'Tạo lesson thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Tạo lesson thất bại',
        })
    }
}

export const editLesson = async (req, res) => {
    try {
        const lessonId = req.params.lessonId
        let { title, description, videoUrl, images, body, status, isDeleteImg } = req.body

        let imageUrl = ""
        let newImages = false
        isDeleteImg = isDeleteImg === 'true'
        if (req.file && !isDeleteImg) {
            imageUrl = await uploadImage(req, res, 'lessons')
            newImages = true
        }
        if (isDeleteImg) {
            imageUrl = []
        }
        const updatedLesson = await Lesson.findByIdAndUpdate(
            lessonId,
            {
                title: title,
                description: description,
                video_url: videoUrl,
                images: newImages ? imageUrl : images,
                body: body,
                status: status,
            },
            { new: true },
        )

        if (!updatedLesson) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy lesson',
            })
        }

        return res.status(httpStatus.OK).json({
            data: updatedLesson,
            message: 'Cập nhật lesson thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Cập nhật lesson thất bại',
        })
    }
}

export const deleteLesson = async (req, res) => {
    try {
        const lessonId = req.params.lessonId
        const deletedLesson = await Lesson.findByIdAndDelete(lessonId)

        if (!deletedLesson) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy lesson',
            })
        }

        // Xóa tất cả bài tập liên quan đến lesson này
        const exercises = await Exercise.find({ lesson_id: lessonId })
        await Exercise.deleteMany({ lesson_id: lessonId })
        await Question.deleteMany({ lesson_id: lessonId })
        await Score.deleteMany({lesson_id: lessonId})
        for (const exercise of exercises) {
            await Answer.deleteMany({ exercise_id: exercise._id })
        }
        // Xóa tất cả điểm số liên quan đến lesson này va xoa ca submit answer


        return res.status(httpStatus.OK).json({
            message: 'Xóa lesson thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Xóa lesson thất bại',
        })
    }
}

export const getLessonById = async (req, res) => {
    try {
        const lessonId = req.params.lessonId
        const lesson = await Lesson.findById(lessonId)

        if (!lesson) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy lesson',
            })
        }

        lesson.view_count += 1
        await lesson.save()

        return res.status(httpStatus.OK).json({
            data: lesson,
            message: 'Lấy lesson thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Không tìm thấy lesson',
        })
    }
}

export const getListLessons = async (req, res) => {
    try {
        let { page, perPage } = req.query
        if (!page || !perPage) {
            page = PAGE
            perPage = PER_PAGE
        }
        let lessons, totalLessons
        if (parseInt(perPage, 10) === -1) {
            lessons = await Lesson.find()
            totalLessons = lessons.length
        } else {
            const skip = (page - 1) * perPage
            const limit = parseInt(perPage, 10)
            lessons = await Lesson.find().skip(skip).limit(limit)
            totalLessons = await Lesson.countDocuments()
        }

        return res.status(httpStatus.OK).json({
            data: lessons,
            page: parseInt(page, 10),
            totalPages: perPage === -1 ? 1 : Math.ceil(totalLessons / perPage),
            message: 'Lấy danh sách lesson thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Lấy danh sách lessons thất bại',
        })
    }
}

export const changeLessonStatus = async (req, res) => {
    try {
        const { lessonId } = req.params
        const { status } = req.body

        const updatedLesson = await Lesson.findByIdAndUpdate(
            lessonId,
            { status },
            { new: true },
        )

        if (!updatedLesson) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy lesson',
            })
        }

        return res.status(httpStatus.OK).json({
            data: updatedLesson,
            message: 'Cập nhật trạng thái lesson thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Cập nhật trạng thái lesson thất bại',
        })
    }
}

export const getLessonsByCourseIdForStudent = async (req, res) => {
    try {
        const { courseId, userId } = req.body
        const lessons = await Lesson.find({ course_id: courseId })

        const lessonsWithExercises = await Promise.all(
            lessons.map(async (lesson) => {
                const exercises = await Exercise.find({ lesson_id: lesson._id })
                const exerciseCount = await Exercise.countDocuments({ lesson_id: lesson._id });
                const scores = await Score.countDocuments({ user_id: userId, lesson_id: lesson._id })
                return {
                    ...lesson.toObject(),
                    unFinished: exerciseCount - scores,
                    exercises: exercises,
                }
            })
        )

        // const lessonsWithExercises2 = await Promise.all(
        //     lessons.map(async (lesson) => {
        //         const exercises = await Promise.all(
        //             (await Exercise.find({ lesson_id: lesson._id })).map(async (exercise) => {
        //                 const score = await Score.findOne({ user_id: userId, exercise_id: exercise._id });
        //                 return {
        //                     ...exercise.toObject(),
        //                     score: score ? score.score : null, // Include the user's score or null if not found
        //                 };
        //             })
        //         );
        //         return {
        //             ...lesson.toObject(),
        //             exercises: exercises,
        //         };
        //     })
        // );

        return res.status(httpStatus.OK).json({
            data: lessonsWithExercises,
            message: 'Lấy danh sách lesson thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Lấy danh sách lesson thất bại',
        })
    }
}

export const getLessonsByCourseId = async (req, res) => {
    try {
        const { courseId } = req.params
        const lessons = await Lesson.find({ course_id: courseId })

        const lessonsWithExercises = await Promise.all(
            lessons.map(async (lesson) => {
                const exercises = await Exercise.find({ lesson_id: lesson._id })
                return {
                    ...lesson.toObject(),
                    exercises: exercises,
                }
            })
        )

        return res.status(httpStatus.OK).json({
            data: lessonsWithExercises,
            message: 'Lấy danh sách lesson thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Lấy danh sách lesson thất bại',
        })
    }
}

// export const getListExerciseAndProcessByLessonIdForTeacher = async (req, res) => {
//     try {
//         const { lessonId } = req.params
//
//         const lesson = await Lesson.findById(lessonId)
//         const exercises = await Exercise.find({ lesson_id: lessonId })
//
//         if (!exercises) {
//             return res.status(httpStatus.NOT_FOUND).json({
//                 message: 'Không tìm thấy bài tập',
//             })
//         }
//
//         const userInCourse = await CourseMember.countDocuments({ course_id: lesson.course_id })
//
//         const exercisesWithProcess = await Promise.all(
//             exercises.map(async (exercise) => {
//                 const userSubmit = await Score.countDocuments({ exercises: exercise._id })
//                 return {
//                     ...exercise.toObject(),
//                     process: Math.round(userSubmit / userInCourse * 100),
//                 };
//             })
//         );
//
//         return res.status(httpStatus.OK).json({
//             data: exercisesWithProcess,
//             message: 'Lấy bài tập theo lesson thành công',
//         });
//     } catch (e) {
//         return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
//             message: e.message || 'Lấy bài tập theo lesson thất bại',
//         })
//     }
// }
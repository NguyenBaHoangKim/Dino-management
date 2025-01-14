import express from 'express'
import * as lessonController from '#controllers/lesson'
import upload from '#middlewares/file'
import validate from '#middlewares/validation'

const router = express.Router()

router
    .route('/')
    .get(lessonController.getListLessons)

router
    .route('/status/:lessonId')
    .patch(validate, lessonController.changeLessonStatus)

router
    .route('/course/:courseId')
    .post(validate, upload.single('images'), lessonController.createLessonByCourseId)
    .get(lessonController.getLessonsByCourseId)

router
    .route('/:lessonId')
    .get(lessonController.getLessonById)
    .put(validate, upload.single('images'), lessonController.editLesson)
    .delete(lessonController.deleteLesson)

export default router

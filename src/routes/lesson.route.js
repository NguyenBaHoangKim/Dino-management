import express from 'express'
import * as lessonController from '#controllers/lesson'
import upload from '#middlewares/file'
import validate from '#middlewares/validation'
import { authorize } from '../middlewares/auth.middleware.js'

const router = express.Router()

router
    .route('/')
    .get(lessonController.getListLessons)

router
    .route('/status/:lessonId')
    .patch(authorize(), validate, lessonController.changeLessonStatus)

router
    .route('/course/:courseId')
    .post(authorize(), validate, upload.single('images'), lessonController.createLessonByCourseId)
    .get(lessonController.getLessonsByCourseId)

router
    .route('/:lessonId')
    .get(lessonController.getLessonById)
    .put(upload.single('images'), lessonController.editLesson)
    .delete(authorize(), lessonController.deleteLesson)

export default router

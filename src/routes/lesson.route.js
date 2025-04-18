import express from 'express'
import * as lessonController from '#controllers/lesson'
import upload from '#middlewares/file'
// import validate from '#middlewares/validation'
import { authorize } from '../middlewares/auth.middleware.js'
import { ROLE } from '../enums/role.enum.js'

const router = express.Router()

router
    .route('/')
    .get(lessonController.getListLessons)

router
    .route('/:lessonId')
    .get(lessonController.getLessonById)
    .put(authorize([ROLE.TEACHER, ROLE.ADMIN]), upload.single('images'), lessonController.editLesson)
    .delete(authorize([ROLE.TEACHER, ROLE.ADMIN]), lessonController.deleteLesson)

router
    .route('/status/:lessonId')
    .patch(authorize(), lessonController.changeLessonStatus)

router
    .route('/course/:courseId')
    .post(authorize([ROLE.TEACHER, ROLE.ADMIN]), upload.single('images'), lessonController.createLessonByCourseId)
    .get(lessonController.getLessonsByCourseId)

router
    .route('/lesson-student')
    .post(lessonController.getLessonsByCourseIdForStudent)

export default router

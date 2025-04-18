import express from 'express'
import * as exerciseController from '../controllers/exercise.controller.js'
import { authorize } from '../middlewares/auth.middleware.js'
import { ROLE } from '../enums/role.enum.js'

const router = express.Router()

router
    .route('/')
    .post(authorize([ROLE.TEACHER, ROLE.ADMIN]), exerciseController.createExercise)
    .get(exerciseController.getAllExercises)

router
    .route('/remove-result')
    .post(authorize([ROLE.TEACHER, ROLE.ADMIN]), exerciseController.removeExerciseResultUser)

router
    .route('/:exerciseId')
    .get(exerciseController.getExerciseById)
    .put(authorize([ROLE.TEACHER, ROLE.ADMIN]), exerciseController.updateExercise)
    .delete(authorize([ROLE.TEACHER, ROLE.ADMIN]), exerciseController.deleteExercise)

router
    .route('/teacher/:lessonId')
    .get(exerciseController.getExerciseByLessonIdForTeacher)

router
    .route('/lesson/:lessonId/user/:userId')
    .get(exerciseController.getExerciseByLessonIdForStudent)

export default router
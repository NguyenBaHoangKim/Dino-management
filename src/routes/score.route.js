import express from 'express'
import { authorize } from '../middlewares/auth.middleware.js'
import * as scoreController from '../controllers/score.controller.js'
import { getListAverageScoreInCourse } from '../services/score.service.js'
import { ROLE } from '../enums/role.enum.js'

const router = express.Router()

router
    .route('/')
    .post(authorize(), scoreController.createScore)
    .get(scoreController.getScore)

router
    .route('/:scoreId')
    .put(authorize(), scoreController.editScore)
    .delete(authorize([ROLE.TEACHER, ROLE.ADMIN]), scoreController.deleteScore)

// router
//     .route('/average-course/:courseId')
//     .get(scoreController.getListAverageScoreInCourse)

router
    .route('/exercise/:exerciseId')
    .get(scoreController.getScoreByExerciseId)

router
    .route('/course/:courseId')
    .get(scoreController.getAllScoreInCourse)

router
    .route('/:userId/:lessonId')
    .get(scoreController.getScoreByUserIdAndLessonId)



export default router
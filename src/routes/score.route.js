import express from 'express'
import { authorize } from '../middlewares/auth.middleware.js'
import * as scoreController from '../controllers/score.controller.js'
import { getListAverageScoreInCourse } from '../services/score.service.js'

const router = express.Router()

router
    .route('/')
    .post(scoreController.createScore)
    .get(scoreController.getScore)

//getListAverageScoreInExercise
router
    .route('/average-course/:courseId')
    .get(scoreController.getListAverageScoreInCourse)

router
    .route('/:userId/:lessonId')
    .get(scoreController.getScoreByUserIdAndLessonId)


export default router
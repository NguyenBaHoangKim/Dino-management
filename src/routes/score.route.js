import express from 'express'
import { authorize } from '../middlewares/auth.middleware.js'
import * as scoreController from '../controllers/score.controller.js'

const router = express.Router()

router
    .route('/')
    .post(scoreController.createScore)
    .get(scoreController.getScore)

router
    .route('/:userId/:lessonId')
    .get(scoreController.getScoreByUserIdAndLessonId)

export default router
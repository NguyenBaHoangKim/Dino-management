import express from 'express'
import * as quizController from '../controllers/quiz.controller.js'
import { authorize } from '../middlewares/auth.middleware.js'
import upload from '../middlewares/file.middleware.js'

const router = express.Router()

router
    .route('/')
    .post(upload.single('image'), quizController.createQuiz)
    .get(quizController.getAllQuizs)

router
    .route('/edit')
    .put(upload.single('image'), quizController.editQuiz)

router
    .route('/delete/:id')
    .delete(quizController.deleteQuiz)

router
    .route('/:id')
    .get(quizController.getQuizById)

router
    .route('/exercise/:exerciseId')
    .get(quizController.getQuizsByExerciseId)

router
    .route('/next-question')
    .post(quizController.getNextQuestion)

router
    .route('/answer')
    .post(quizController.answerQuiz)

router
    .route('/answer-multiple')
    .post(quizController.answerMultipleQuiz)

router
    .route('/get-submitted-quiz')
    .post(quizController.getQuizAndAnswerByUserIdAndLessonId)

export default router
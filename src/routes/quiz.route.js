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
    .route('/edit/:id')
    .put(upload.single('image'), authorize(), quizController.editQuiz)

router
    .route('/delete/:id')
    .delete(authorize(), quizController.deleteQuiz)

router
    .route('/:id')
    .get(quizController.getQuizById)

router
    .route('/lesson/:lessonId')
    .get(quizController.getQuizsByLessonId)

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
import express from 'express'
import * as quizController from '../controllers/quiz.controller.js'
import { authorize } from '../middlewares/auth.middleware.js'
import upload from '../middlewares/file.middleware.js'
import { ROLE } from '../enums/role.enum.js'

const router = express.Router()

router
    .route('/')
    .post(authorize([ROLE.TEACHER, ROLE.ADMIN]), upload.single('image'), quizController.createQuiz)
    .get(quizController.getAllQuizs)

router
    .route('/import')
    .post(upload.single('file'), quizController.importQuizData)

router
    .route('/edit')
    .put(authorize([ROLE.TEACHER, ROLE.ADMIN]), upload.single('image'), quizController.editQuiz)

router
    .route('/delete/:id')
    .delete(authorize([ROLE.TEACHER, ROLE.ADMIN]), quizController.deleteQuiz)

router
    .route('/:id')
    .get(quizController.getQuizById)

router
    .route('/exercise/:exerciseId')
    .get(quizController.getQuizsByExerciseId)

router
    .route('/exercise/teacher/:exerciseId')
    .get(authorize([ROLE.TEACHER, ROLE.ADMIN]), quizController.getQuizsByExerciseIdForTeacher)

router
    .route('/answer')
    .post(authorize(), quizController.answerQuiz)

router
    .route('/answer-multiple')
    .post(authorize(), quizController.answerMultipleQuiz)

router
    .route('/get-submitted-quiz')
    .post(authorize(), quizController.getQuizAndAnswerByUserIdAndExerciseId)

export default router
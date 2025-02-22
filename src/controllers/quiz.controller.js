import * as quizService from '../services/quiz.service.js'
import { answerMultipleQuestions } from '../services/quiz.service.js'

export const createQuiz = async (req, res) => {
    await quizService.createQuiz(req, res)
}

export const editQuiz = async (req, res) => {
    await quizService.editQuiz(req, res)
}

export const deleteQuiz = async (req, res) => {
    await quizService.deleteQuiz(req, res)
}

export const getQuizById = async (req, res) => {
    await quizService.getQuizById(req, res)
}

export const getAllQuizs = async (req, res) => {
    await quizService.getAllQuizs(req, res)
}

export const getQuizsByLessonId = async (req, res) => {
    await quizService.getQuizsByLessonId(req, res)
}

export const getNextQuestion = async (req, res) => {
    await quizService.getNextQuestion(req, res)
}

export const answerQuiz = async (req, res) => {
    await quizService.answerQuiz(req, res)
}

export const answerMultipleQuiz = async (req, res) => {
    await quizService.answerMultipleQuestions(req, res)
}

export const getQuizAndAnswerByUserIdAndLessonId = async (req, res) => {
    await quizService.getQuizAndAnswerByUserIdAndLessonId(req, res)
}
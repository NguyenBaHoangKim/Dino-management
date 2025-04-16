import * as scoreService from '../services/score.service.js'

export const createScore = async (req, res) => {
    await scoreService.createScore(req, res)
}

export const getScore = async (req, res) => {
    await scoreService.getScore(req, res)
}

export const editScore = async (req, res) => {
    await scoreService.editScore(req, res)
}

export const deleteScore = async (req, res) => {
    await scoreService.deleteScore(req, res)
}

export const getScoreByUserIdAndLessonId = async (req, res) => {
    await scoreService.getScoreByUserIdAndLessonId(req, res)
}

export const getListAverageScoreInCourse = async (req, res) => {
    await scoreService.getListAverageScoreInCourse(req, res)
}

export const getScoreByExerciseId = async (req, res) => {
    await scoreService.getScoreByExerciseId(req, res)
}

export const getAllScoreInCourse = async (req, res) => {
    await scoreService.getAllScoreInCourse(req, res)
}
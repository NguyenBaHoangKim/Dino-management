import * as scoreService from '../services/score.service.js'

export const createScore = async (req, res) => {
    await scoreService.createScore(req, res)
}

export const getScore = async (req, res) => {
    await scoreService.getScore(req, res)
}

export const getScoreByUserIdAndLessonId = async (req, res) => {
    await scoreService.getScoreByUserIdAndLessonId(req, res)
}

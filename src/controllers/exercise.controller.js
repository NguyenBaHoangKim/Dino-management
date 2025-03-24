import * as exerciseService from '../services/exercise.service.js'

export const createExercise = async (req, res) => {
    await exerciseService.createExercise(req, res)
}

export const getExerciseById = async (req, res) => {
    await exerciseService.getExerciseById(req, res)
}

export const updateExercise = async (req, res) => {
    await exerciseService.updateExercise(req, res)
}

export const deleteExercise = async (req, res) => {
    await exerciseService.deleteExercise(req, res)
}

export const getAllExercises = async (req, res) => {
    await exerciseService.getAllExercises(req, res)
}

export const removeExerciseResultUser = async (req, res) => {
    await exerciseService.removeExerciseResultUser(req, res)
}

export const getExerciseByLessonIdForStudent = async (req, res) => {
    await exerciseService.getExerciseByLessonIdForStudent(req, res)
}
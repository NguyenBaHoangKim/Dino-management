import express from 'express'
import * as exerciseController from '../controllers/exercise.controller.js'

const router = express.Router()

router
    .route('/')
    .post(exerciseController.createExercise)
    .get(exerciseController.getAllExercises)

router
    .route('/:exerciseId')
    .get(exerciseController.getExerciseById)
    .put(exerciseController.updateExercise)
    .delete(exerciseController.deleteExercise)

export default router
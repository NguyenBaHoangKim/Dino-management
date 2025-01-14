import express from 'express'
import * as sessionController from '#controllers/session'
import validate from '#middlewares/validation'

const router = express.Router()

router
    .route('/')
    .post(validate, sessionController.saveSessionController)

router
    .route('/user/:userId')
    .get(sessionController.getSessionByUserIdController)

export default router
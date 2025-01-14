import express from 'express'
import * as userController from '#controllers/user'
import { authorize } from '#middlewares/auth'
import validate from '#middlewares/validation'
import upload from '../middlewares/file.middleware.js'

const router = express.Router()

router
    .route('/me')
    .get(authorize(), userController.getCurrentUser)

router
    .route('/:id')
    .get(authorize(), userController.getUserById)
    .put(authorize(), upload.single('avatar'), userController.editUser)

router.route('/').get(userController.getAllUsers)

router
    .route('/reset-password')
    .post(validate, authorize(), userController.sendPasswordReset)

export default router

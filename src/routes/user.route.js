import express from 'express'
import * as userController from '#controllers/user'
import { authorize } from '#middlewares/auth'
import validate from '#middlewares/validation'
import upload from '../middlewares/file.middleware.js'
import { ROLE } from '../enums/role.enum.js'

const router = express.Router()

router
    .route('/me')
    .get(authorize(), userController.getCurrentUser)

router
    .route('/:id')
    .get(authorize(), userController.getUserById)

router
    .route('/edit')
    .put(authorize(), upload.single('avatar'), userController.editUser)

router
    .route('/')
    .get(userController.getAllUsers)

router
    .route('/reset-password')
    .post(validate, authorize(), userController.sendPasswordReset)

router
    .route('/change-role')
    .put(authorize([ROLE.ADMIN]), userController.changeUserRole)

export default router

import express from 'express'
import * as authController from '#controllers/auth'
import { authorize, oAuth as oAuthLogin } from '#middlewares/auth'
// import validate from '#middlewares/validation'

const router = express.Router()

router //
    .route('/register')
    .post(authController.register)

router //
    .route('/login')
    .post(authController.login)

router //
    .route('/logout')
    .post(authorize(), authController.logout)

router //
    .route('/refresh-token')
    .post(authController.refreshToken)

router
    .route('/change-password')
    .post(authController.changePassword)

router
    .route('/reset-password/:userId')
    .post(authController.resetPassword) //add authorize()

// router //
//     .route('/google')
//     .post(oAuthLogin('google'), authController.oAuth)

export default router
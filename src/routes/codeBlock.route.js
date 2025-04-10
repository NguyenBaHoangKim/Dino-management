import express from 'express'
import * as codeBlockController from '#controllers/codeBlock'

const router = express.Router()

router
    .route('/')
    .post(codeBlockController.createCode)

router
    .route('/lastest')
    .get(codeBlockController.getLatestCode)

router
    .route('/push')
    .post(codeBlockController.postCode)

export default router
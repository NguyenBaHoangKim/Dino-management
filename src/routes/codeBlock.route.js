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

router
    .route('/run')
    .post(codeBlockController.runCode)

export default router
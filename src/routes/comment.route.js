import express from 'express'
import * as commentController from '#controllers/comment'
import validate from '#middlewares/validation'
import { authorize } from '../middlewares/auth.middleware.js'

const router = express.Router()

router
    .route('/')
    .post(validate, commentController.createComment)
    .get(commentController.getAllComments)

router //dang thua
    .route('/sub')
    .post(validate, commentController.createSubComment)

router
    .route('/commentable/:commentableId')
    .get(commentController.getCommentsByCommentableId)

router
    .route('/all-comments/:commentableId')
    .get(commentController.getAllCommentBySubComment)

router
    .route('/:commentId')
    .put(authorize(), validate, commentController.editComment)
    .get(commentController.getCommentById)
    .delete(commentController.deleteComment)

router
    .route('/like')
    .post(authorize(), validate, commentController.likeComment)

export default router
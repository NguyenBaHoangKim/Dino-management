import express from 'express'
import * as commentController from '#controllers/comment'
import validate from '#middlewares/validation'

const router = express.Router()

router
    .route('/')
    .post(validate, commentController.createComment)
    .get(commentController.getAllComments)

router
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
    .put(validate, commentController.editComment)
    .get(commentController.getCommentById)
    .delete(commentController.deleteComment)

router
    .route('/like')
    .post(validate, commentController.likeComment)

export default router
import express from 'express'
import * as commentController from '#controllers/comment'
// import validate from '#middlewares/validation'
import { authorize } from '../middlewares/auth.middleware.js'

const router = express.Router()

router
    .route('/')
    .post(commentController.createComment)
    .get(commentController.getAllComments)

router //dang thua
    .route('/sub')
    .post(commentController.createSubComment)

router
    .route('/commentable/:commentableId/user/:userId')
    .get(commentController.getCommentsByCommentableId)

router // cai cu k dung nua
    .route('/all-comments/:commentableId')
    .get(commentController.getAllCommentBySubComment)

router
    .route('/:commentId')
    .put(authorize(), commentController.editComment)
    .get(commentController.getCommentById)
    .delete(commentController.deleteComment)

router
    .route('/nguyen-comment')
    .post(commentController.getNguyenComment)

router
    .route('/nguyen-sub-comment')
    .post(commentController.getNguyenSubComment)

router
    .route('/like')
    .post(authorize(), commentController.likeComment)

export default router
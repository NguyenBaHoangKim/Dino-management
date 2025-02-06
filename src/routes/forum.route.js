import express from 'express'
import * as forumController from '#controllers/forum'
import upload from '#middlewares/file'
import validate from '#middlewares/validation'

const router = express.Router()

router
    .route('/')
    .get(forumController.getListForums)
    .post(validate, upload.single('image'), forumController.createForum)

router
    .route('/:forumId')
    .get(forumController.getForumById)
    .put(validate, upload.single('image'), forumController.editForum)
    .delete(forumController.deleteForum)

router.route('/user/:userId').get(forumController.getForumsByUserId)

router
    .route('/like')
    .post(forumController.likeForum)

export default router

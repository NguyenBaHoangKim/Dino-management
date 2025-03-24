import express from 'express'
import * as forumController from '#controllers/forum'
import upload from '#middlewares/file'
// import validate from '#middlewares/validation'

const router = express.Router()

router
    .route('/')
    .get(forumController.getListForums)
    .post(upload.single('image'), forumController.createForum)

router
    .route('/userId/:userId')
    .get(forumController.getListForumsBaseOnUserId)

router
    .route('/:forumId')
    .get(forumController.getForumById)
    .put(upload.single('image'), forumController.editForum)
    .delete(forumController.deleteForum)

router
    .route('/user/:userId')
    .get(forumController.getForumsByUserId)

router
    .route('/like')
    .post(forumController.likeForum)

router
    .route('/like/check')
    .post(forumController.isLikedForum)

router
    .route('/repost')
    .post(forumController.reportForum)

router
    .route('/repost/:userId')
    .get(forumController.getRepostForumByUserId)

router
    .route('/like/user/:userId')
    .get(forumController.getListForumLikedByUserId)

export default router

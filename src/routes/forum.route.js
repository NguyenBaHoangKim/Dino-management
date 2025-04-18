import express from 'express'
import * as forumController from '#controllers/forum'
import upload from '#middlewares/file'
import { authorize } from '../middlewares/auth.middleware.js'
import { ROLE } from '../enums/role.enum.js'
// import validate from '#middlewares/validation'

const router = express.Router()

router
    .route('/')
    .get(forumController.getListForums)
    .post(authorize(), upload.single('image'), forumController.createForum)

router
    .route('/userId/:userId')
    .get(forumController.getListForumsBaseOnUserId)

router
    .route('/:forumId')
    .get(forumController.getForumById)
    .put(authorize(), upload.single('image'), forumController.editForum)
    .delete(authorize(), forumController.deleteForum)

router
    .route('/user/:userId')
    .get(forumController.getForumsByUserId)

router
    .route('/like')
    .post(authorize(), forumController.likeForum)

router
    .route('/like/check')
    .post(forumController.isLikedForum)

router
    .route('/user-liked/:forumId')
    .get(forumController.getListUserLikedForum)

router
    .route('/repost')
    .post(authorize(), forumController.reportForum)

router
    .route('/repost/:userId')
    .get(forumController.getRepostForumByUserId)

router
    .route('/like/user/:userId')
    .get(forumController.getListForumLikedByUserId)

export default router

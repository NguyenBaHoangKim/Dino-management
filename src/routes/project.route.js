import express from 'express'
import * as projectController from '#controllers/project'
import upload from '#middlewares/file'
// import validate from '#middlewares/validation'
import { authorize } from '../middlewares/auth.middleware.js'

const router = express.Router()

router
    .route('/')
    .post(authorize(), upload.single('images'), projectController.createProject)
    .get(projectController.getListProjects)

router
    .route('/search-type')
    .get(projectController.getListProjectsByName)

router
    .route('/clone')
    .post(authorize(), projectController.cloneProject)

router
    .route('/change-type')
    .post(authorize(), projectController.setTypeProject)

router
    .route('/type/:type')
    .get(projectController.getProjectsByType)

router
    .route('/favorite')
    .post(authorize(), projectController.addProjectToFavorites) //add or remove
    .get(projectController.getFavoriteProjects)

router
    .route('/like')
    .post(authorize(), projectController.likeProject)

router
    .route('/like/check')
    .post(authorize(), projectController.isLikedProject)

router
    .route('/user/:userId')
    .get(projectController.getProjectsByUserId)

router
    .route('/:projectId')
    .get(projectController.getProjectById)
    .put(authorize(), upload.single('images'), projectController.editProject)
    .delete(authorize(), projectController.deleteProject)

router
    .route('/')
    //.post(upload.single('image'), projectController.createProject)
    //.post(validate, upload.single('image'), projectController.createProject)
    //.get(projectController.getListProjects)

export default router

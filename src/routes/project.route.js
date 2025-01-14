import express from 'express'
import * as projectController from '#controllers/project'
import upload from '#middlewares/file'
import validate from '#middlewares/validation'

const router = express.Router()

router
    .route('/')
    .post(upload.single('images'), projectController.createProject)
    .get(projectController.getListProjects)

router
    .route('/search')
    .get(projectController.getListProjectsByName)


router
    .route('/change-type')
    .post(projectController.setTypeProject)

router
    .route('/type/:type')
    .get(projectController.getProjectsByType)

router
    .route('/favorite')
    .post(validate, projectController.addProjectToFavorites) //add or remove
    .get(projectController.getFavoriteProjects)

router
    .route('/like')
    .post(projectController.likeProject)

router
    .route('/like/check')
    .post(projectController.isLikedProject)

router
    .route('/user/:userId')
    .get(projectController.getProjectsByUserId)

router
    .route('/:projectId')
    .get(projectController.getProjectById)
    .put(upload.single('images'), projectController.editProject)
    .delete(projectController.deleteProject)

router
    .route('/')
    //.post(upload.single('image'), projectController.createProject)
    //.post(validate, upload.single('image'), projectController.createProject)
    //.get(projectController.getListProjects)

export default router

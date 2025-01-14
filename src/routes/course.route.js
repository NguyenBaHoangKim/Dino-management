import express from 'express'
import * as courseController from '#controllers/course'
import upload from '#middlewares/file'
import validate from '#middlewares/validation'

const router = express.Router()

router
    .route('/')
    .post(validate, upload.single('file'), courseController.createCourse)
    .get(courseController.getListCoursePerPage)

router
    .route('/favorite') //phai cho len truoc /:courseId
    .post(validate, courseController.addCourseFavorite)
    .get(courseController.getFavoriteCourses)

router
    .route('/change-type')
    .post(courseController.changeCourseType)

router
    .route('/favorite')
    .post(validate, courseController.addCourseFavorite)
    .get(courseController.getFavoriteCourses)

router
    .route('/:courseId')
    .get(courseController.getCourseById)
    .put(validate, upload.single('file'), courseController.editCourse)
    .delete(courseController.deleteCourse)


export default router
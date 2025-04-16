import express from 'express'
import * as courseController from '#controllers/course'
import upload from '#middlewares/file'
// import validate from '#middlewares/validation'
import { authorize } from '../middlewares/auth.middleware.js'

const router = express.Router()

router
    .route('/')
    .post(upload.single('file'), courseController.createCourse)
    .get(courseController.getListCoursePerPage)

router
    .route('/favorite') //phai cho len truoc /:courseId
    .post(authorize(), courseController.addCourseFavorite)
    .get(courseController.getFavoriteCourses)

router
    .route('/change-type')
    .post(authorize(), courseController.changeCourseType)

router
    .route('/favorite')
    .post(authorize(), courseController.addCourseFavorite)
    .get(courseController.getFavoriteCourses)

router
    .route('/member/:userId')
    .get(courseController.getCourseForMember)

router
    .route('/teacher/:userId')
    .get(courseController.getCourseForTeacher)

router
    .route('/member/list-member/:courseId')
    .get(courseController.getMemberInCourse)

router
    .route('/add-student')
    .post(courseController.addStudentToCourse)

router
    .route('/clone-course')
    .post(upload.single('file'), courseController.cloneCourse)

router
    .route('/remove-student')
    .post(courseController.removeStudentFromCourse)

router
    .route('/:courseId')
    .get(courseController.getCourseById)
    .put(upload.single('file'), courseController.editCourse)
    .delete(courseController.deleteCourse)


export default router
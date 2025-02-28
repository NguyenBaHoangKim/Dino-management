import express from 'express'
import * as classroomController from '#controllers/classroom'
import validate from '#middlewares/validation'
import { authorize } from '../middlewares/auth.middleware.js'
import { ROLE } from '../enums/role.enum.js'
import upload from '../middlewares/file.middleware.js'

const router = express.Router()

router
    .route('/')
    .post(authorize([ROLE.TEACHER]), upload.single('image'), validate, classroomController.createClassroom)
    .get(classroomController.getClassroomByPage)

router
    .route('/teacher/:teacherId')
    .get(authorize(), classroomController.getClassroomsByTeacherId)

router
    .route('/:classroomId/students')
    .get(authorize(), classroomController.getStudentsInClassroom)

router
    .route('/:classroomId/students/:studentId')
    .delete(authorize(), classroomController.deleteStudentFromClassroom)

router
    .route('/add-student')
    .post(authorize([ROLE.TEACHER]), validate, classroomController.addStudentToClassroom)

router
    .route('/:classroomId')
    .put(authorize(), upload.single('image'), validate, classroomController.editClassroom)
    .get(classroomController.getClassroomById)
    .delete(authorize(), classroomController.deleteClassroom)

router
    .route('/course')
    .post(authorize(), validate, classroomController.addCourse)

router
    .route('/course/delete')
    .post(authorize(), classroomController.deleteCourse)


export default router
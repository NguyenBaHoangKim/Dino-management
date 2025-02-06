import express from 'express'
import * as classroomController from '#controllers/classroom'
import validate from '#middlewares/validation'
import { authorize } from '../middlewares/auth.middleware.js'
import { ROLE } from '../enums/role.enum.js'

const router = express.Router()

router
    .route('/')
    .post(authorize([ROLE.TEACHER]) ,validate, classroomController.createClassroom)
    .get(classroomController.getAllClassrooms)

router
    .route('/teacher/:teacherId')
    .get(classroomController.getClassroomsByTeacherId)

router
    .route('/:classroomId/students')
    .get(classroomController.getStudentsInClassroom)

router
    .route('/:classroomId/students/:studentId')
    .delete(classroomController.deleteStudentFromClassroom)

router
    .route('/add-student')
    .post(authorize([ROLE.TEACHER]) ,validate, classroomController.addStudentToClassroom)

router
    .route('/:classroomId')
    .put(validate, classroomController.editClassroom)
    .get(classroomController.getClassroomById)
    .delete(classroomController.deleteClassroom)

router
    .route('/course')
    .post(validate, classroomController.addCourse)

router
    .route('/course/delete')
    .post(classroomController.deleteCourse)


export default router
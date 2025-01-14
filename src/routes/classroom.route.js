import express from 'express'
import * as classroomController from '#controllers/classroom'
import validate from '#middlewares/validation'

const router = express.Router()

router
    .route('/')
    .post(validate, classroomController.createClassroom)
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
    .post(validate, classroomController.addStudentToClassroom)

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
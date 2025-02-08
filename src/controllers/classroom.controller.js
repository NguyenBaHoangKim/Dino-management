import * as classroomService from '#services/classroom'

export const createClassroom = async (req, res) => {
    await classroomService.createClassroom(req, res)
}

export const getClassroomsByTeacherId = async (req, res) => {
    await classroomService.getClassroomsByTeacherId(req, res)
}

export const getStudentsInClassroom = async (req, res) => {
    await classroomService.getStudentsInClassroom(req, res)
}

export const addStudentToClassroom = async (req, res) => {
    await classroomService.addStudentToClassroom(req, res)
}

export const editClassroom = async (req, res) => {
    await classroomService.editClassroom(req, res)
}

export const deleteClassroom = async (req, res) => {
    await classroomService.deleteClassroom(req, res)
}

export const deleteStudentFromClassroom = async (req, res) => {
    await classroomService.deleteStudentFromClassroom(req, res)
}

export const addCourse = async (req, res) => {
    await classroomService.addCourseToClassroom(req, res)
}

export const deleteCourse = async (req, res) => {
    await classroomService.deleteCourseFromClassroom(req, res)
}

export const getClassroomById = async (req, res) => {
    await classroomService.getClassroomById(req, res)
}

export const getClassroomByPage = async (req, res) => {
    await classroomService.getClassroomByPage(req, res)
}
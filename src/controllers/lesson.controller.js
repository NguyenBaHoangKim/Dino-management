import * as lessonService from '#services/lesson'

export const editLesson = async (req, res) => {
    await lessonService.editLesson(req, res)
}

export const deleteLesson = async (req, res) => {
    await lessonService.deleteLesson(req, res)
}

export const getLessonById = async (req, res) => {
    await lessonService.getLessonById(req, res)
}

export const getListLessons = async (req, res) => {
    await lessonService.getListLessons(req, res)
}

export const changeLessonStatus = async (req, res) => {
    await lessonService.changeLessonStatus(req, res)
}

export const getLessonsByCourseId = async (req, res) => {
    await lessonService.getLessonsByCourseId(req, res)
}

export const getLessonsByCourseIdForStudent = async (req, res) => {
    await lessonService.getLessonsByCourseIdForStudent(req, res)
}

export const createLessonByCourseId = async (req, res) => {
    await lessonService.createLessonByCourseId(req, res)
}
import * as courseService from '#services/course'

export const createCourse = async (req, res) => {
    await courseService.createCourse(req, res)
}

export const editCourse = async (req, res) => {
    await courseService.editCourse(req, res)
}

export const deleteCourse = async (req, res) => {
    await courseService.deleteCourse(req, res)
}

export const getCourseById = async (req, res) => {
    await courseService.getCourseById(req, res)
}

export const getListCoursePerPage = async (req, res) => {
    await courseService.getListCoursePerPage(req, res)
}

export const addCourseFavorite = async (req, res) => {
    await courseService.addCourseToFavorites(req, res)
}

export const getFavoriteCourses = async (req, res) => {
    await courseService.getFavoriteCourses(req, res)
}

export const changeCourseType = async (req, res) => {
    await courseService.setCourseType(req, res)
}

export const addStudentToCourse = async (req, res) => {
    await courseService.addStudentToCourse(req, res)
}

export const addManyStudentToCourse = async (req, res) => {
    await courseService.addManyStudentToCourse(req, res)
}

export const importStudentToCourse = async (req, res) => {
    await courseService.importStudentToCourse(req, res)
}

export const removeStudentFromCourse = async (req, res) => {
    await courseService.removeStudentFromCourse(req, res)
}

export const getCourseForMember = async (req, res) => {
    await courseService.getCourseForMember(req, res)
}

export const getMemberInCourse = async (req, res) => {
    await courseService.getMemberInCourse(req, res)
}

export const getCourseForTeacher = async (req, res) => {
    await courseService.getCourseForTeacher(req, res)
}

export const cloneCourse = async (req, res) => {
    await courseService.cloneCourse(req, res)
}
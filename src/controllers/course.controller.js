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
import Course from '#models/course'
import Lessson from '#models/lesson'
import { uploadImage } from '#utils/github'
import httpStatus from 'http-status'
import { PAGE, PER_PAGE } from '#constants/index'
import { FAVOURITE_TYPE } from '../enums/favouriteType.enum.js'
import Favorite from '../models/favorite.model.js'
import CourseMember from '../models/courseMember.model.js'
import User from '#models/user'

export const createCourse = async (req, res) => {
    try {
        const { title, description, startDate, endDate, certification, teacherId } =
            req.body

        const imageUrl = req.file ? await uploadImage(req, res, 'courses') : []
        const newCourse = new Course({
            title: title,
            description: description,
            start_date: startDate,
            end_date: endDate,
            images: imageUrl,
            certification: certification,
            teacherId: teacherId
        })

        const savedCourse = await newCourse.save()

        return res.status(httpStatus.CREATED).json({
            data: savedCourse,
            message: 'Tạo course thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Tạo course thất bại',
        })
    }
}

export const editCourse = async (req, res) => {
    try {
        const courseId = req.params.courseId
        let { title, description, startDate, endDate, certification, teacherId, image, isDeleteImg } =
            req.body

        let imageUrl = ""
        let newImages = false
        isDeleteImg = isDeleteImg === 'true'
        if (req.file && !isDeleteImg) {
            imageUrl = await uploadImage(req, res, 'courses')
            newImages = true
        }
        //check if isDeleteImg is true, delete old image
        if (isDeleteImg) {
            image = []
        }
        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            {
                title: title,
                description: description,
                start_date: startDate,
                end_date: endDate,
                images: newImages ? imageUrl : image,
                certification: certification,
                teacher_id: teacherId,
            },
            { new: true },
        )

        if (!updatedCourse) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy course',
            })
        }

        return res.status(httpStatus.OK).json({
            data: updatedCourse,
            message: 'Cập nhật course thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Cập nhật course thất bại',
        })
    }
}

export const deleteCourse = async (req, res) => {
    try {
        const courseId = req.params.courseId
        const deletedCourse = await Course.findById(courseId)
        if (!deletedCourse) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy course',
            })
        }

        await Course.findByIdAndDelete(courseId)

        await Lessson.deleteMany({ course_id: courseId })

        await CourseMember.deleteMany({ course_id: courseId })

        return res.status(httpStatus.OK).json({
            message: 'Xóa course thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Xóa course thất bại',
        })
    }
}

//add student to course
export const addStudentToCourse = async (req, res) => {
    try {
        const { courseId, studentId } = req.body

        const checkCourseMember = await CourseMember.find({course_id: courseId, user_id: studentId})

        if (checkCourseMember.length > 0) {
            return res.status(httpStatus.BAD_REQUEST).json({
                message: 'Học viên đã tồn tại trong course',
            })
        }

        const courseMember = new CourseMember({
            course_id: courseId,
            user_id: studentId,
        })

        await courseMember.save()

        return res.status(httpStatus.OK).json({
            message: 'Thêm học viên vào course thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Thêm học viên vào course thất bại',
        })
    }
}

//remove student from course
export const removeStudentFromCourse = async (req, res) => {
    try {
        const { courseId, studentId } = req.body

        const courseMember = await CourseMember.findOneAndDelete({ course_id: courseId, user_id: studentId })

        if (!courseMember) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy học viên trong course',
            })
        }

        return res.status(httpStatus.OK).json({
            message: 'Xóa học viên khỏi course thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Xóa học viên khỏi course thất bại',
        })
    }
}

export const getCourseForMember = async (req, res) => {
    try {
        const { userId } = req.params

        const courses = await CourseMember.find({ user_id: userId }).populate('course_id')

        if (!courses) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy course',
            })
        }

        const courseIds = courses.map(courseMember => courseMember.course_id)

        return res.status(httpStatus.OK).json({
            data: courseIds,
            message: 'Lấy course cho hv thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Không tìm thấy course',
        })
    }
}

export const getMemberInCourse = async (req, res) => {
    try {
        const { courseId } = req.params
        //getMemberInCourse
        const members = await CourseMember.find({ course_id: courseId }).populate('user_id')
        //
        // if (!members) {
        //     return res.status(httpStatus.NOT_FOUND).json({
        //         message: 'Không tìm thấy học viên',
        //     })
        // }

        const memberIds = members.map(member => member.user_id.transform())

        return res.status(httpStatus.OK).json({
            data: memberIds,
            message: 'Lấy học viên thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Không tìm thấy course',
        })
    }
}

export const getCourseForTeacher = async (req, res) => {
    try {
        const { userId } = req.params
        const courses = await Course.find({ teacher_id: userId })

        //const courseIds = courses.map(course => course._id)

        return res.status(httpStatus.OK).json({
            data: courses,
            message: 'Lấy course cho gv thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Không tìm thấy course',
        })
    }
}

export const getCourseById = async (req, res) => {
    try {
        const courseId = req.params.courseId
        const course = await Course.findById(courseId)

        if (!course) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy course',
            })
        }

        return res.status(httpStatus.OK).json({
            data: course,
            message: 'Lấy course thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Không tìm thấy course',
        })
    }
}

export const getListCoursePerPage = async (req, res) => {
    try {
        let { page, perPage } = req.query
        if (!page || !perPage) {
            page = PAGE
            perPage = PER_PAGE
        }
        let courses, totalCourses, totalPages

        if (parseInt(perPage, 10) === -1) {
            courses = await Course.find()
            totalCourses = courses.length
            totalPages = 1
            page = 1
        } else {
            const skip = (page - 1) * perPage
            const limit = parseInt(perPage, 10)
            courses = await Course.find().skip(skip).limit(limit)
            totalCourses = await Course.countDocuments()
            totalPages = Math.ceil(totalCourses / limit)
        }

        return res.status(httpStatus.OK).json({
            data: courses,
            page: parseInt(page, 10),
            totalPages: totalPages,
            message: 'Lấy danh sách courses thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Lấy danh sách courses thất bại',
        })
    }
}

export const getAllCourses = async (req, res) => {
    try {
        let { page, perPage } = req.query
        if (!page || !perPage) {
            page = PAGE
            perPage = PER_PAGE
        }
        let courses, totalCourses, totalPages

        if (parseInt(perPage, 10) === -1) {
            courses = await Course.find().lean()
            totalCourses = courses.length
            totalPages = 1
            page = 1
        } else {
            const skip = (page - 1) * perPage
            const limit = parseInt(perPage, 10)
            courses = await Course.find().skip(skip).limit(limit).lean()
            totalCourses = await Course.countDocuments()
            totalPages = Math.ceil(totalCourses / limit)
        }

        // Populate lessons for each course
        const coursesWithLessons = await Promise.all(
            courses.map(async (course) => {
                const lessons = await Lesson.find({
                    course_id: course._id,
                }).lean()
                return {
                    ...course,
                    lessons: lessons,
                }
            }),
        )

        return res.status(httpStatus.OK).json({
            data: coursesWithLessons,
            page: parseInt(page, 10),
            totalPages: totalPages,
            message: 'Lấy danh sách courses thành công',
        })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Lấy danh sách courses thất bại',
        })
    }
}

export const addCourseToFavorites = async (req, res) => {
    try {
        const { userId, courseId } = req.body

        let favorite = await Favorite.findOne({
            user_id: userId,
            object_type: FAVOURITE_TYPE.COURSE,
        })

        if (favorite) {
            const index = favorite.object_id.indexOf(courseId)
            if (index !== -1) {
                favorite.object_id.splice(index, 1)
                await favorite.save()
                return res.status(httpStatus.OK).json({
                    data: favorite,
                    message: 'Course removed from favorites successfully',
                })
            }
            favorite.object_id.push(courseId)
        } else {
            favorite = new Favorite({
                user_id: userId,
                object_id: [courseId],
                object_type: FAVOURITE_TYPE.COURSE,
            })
        }

        const savedFavorite = await favorite.save()

        return res.status(httpStatus.CREATED).json({
            data: savedFavorite,
            message: 'Course added to favorites successfully',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Failed to add/remove course from favorites',
        })
    }
}

export const getFavoriteCourses = async (req, res) => {
    try {
        const { userId } = req.query

        const favorite = await Favorite.findOne({
            user_id: userId,
            object_type: FAVOURITE_TYPE.COURSE,
        })

        if (!favorite || favorite.object_id.length === 0) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'No favorite courses found',
            })
        }

        const courses = await Course.find({
            _id: { $in: favorite.object_id },
        })

        return res.status(httpStatus.OK).json({
            data: courses,
            message: 'Favorite courses retrieved successfully',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Failed to retrieve favorite courses',
        })
    }
}

export const setCourseType = async (req, res) => {
    try {
        const { courseId, type } = req.body

        const course = await Course.findById(courseId)

        if (!course) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Course not found',
            })
        }

        course.course_type = type
        await course.save()

        return res.status(httpStatus.OK).json({
            data: course,
            message: 'Course type updated successfully',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Failed to update course type',
        })
    }
}

export const likeCourse = async (req, res) => {
    try {
        const { userId, courseId } = req.body

        const course = await Course.findById(courseId)

        if (!course) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Course not found',
            })
        }
        return res.status(httpStatus.OK).json({
            message: 'Course liked successfully',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Failed to like course',
        })
    }
}


import Classroom from '#models/classroom'
import ClassroomMember from '#models/classroomMember'
import httpStatus from 'http-status'
import Course from '../models/course.model.js'

export const createClassroom = async (req, res) => {
    try {
        const { name, description, teacherId } = req.body

        const newClassroom = new Classroom({
            name: name,
            description: description,
            teacher_id: teacherId,
        })

        const savedClassroom = await newClassroom.save()

        return res.status(httpStatus.CREATED).json({
            data: savedClassroom,
            message: 'Tạo classroom thành công',
        })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Tạo classroom thất bại',
        })
    }
}

export const addStudentToClassroom = async (req, res) => {
    try {
        const { classroomId, studentId } = req.body

        const classroom = await Classroom.findOne({
            _id: classroomId,
        })
        if (!classroom) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy classroom hoặc không thuộc giáo viên này',
            })
        }

        const existingMember = await ClassroomMember.findOne({ classroom_id: classroomId, user_id: studentId })
        if (existingMember) {
            return res.status(httpStatus.CONFLICT).json({
                message: 'Học sinh đã có trong classroom',
            })
        }

        const newClassroomMember = new ClassroomMember({
            classroom_id: classroomId,
            user_id: studentId,
        })

        const savedClassroomMember = await newClassroomMember.save()

        return res.status(httpStatus.CREATED).json({
            data: savedClassroomMember,
            message: 'Thêm học sinh vào classroom thành công',
        })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Thêm học sinh vào classroom thất bại',
        })
    }
}

export const getAllClassrooms = async (req, res) => {
    try {
        const classrooms = await Classroom.find().lean()

        const classroomsWithStudents = await Promise.all(
            classrooms.map(async (classroom) => {
                const students = await ClassroomMember.find({
                    classroom_id: classroom._id,
                }).populate('user_id')
                const courses = await Course.find({
                    _id: { $in: classroom.courses },
                })
                return {
                    ...classroom,
                    students: students.map((cm) => cm.user_id.transform()),
                    courses: courses.map((course) => course),
                }
            }),
        )

        return res.status(httpStatus.OK).json({
            data: classroomsWithStudents,
            message: 'Lấy danh sách classrooms thành công',
        })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Lấy danh sách classrooms thất bại',
        })
    }
}

export const getClassroomsByTeacherId = async (req, res) => {
    try {
        const { teacherId } = req.params
        const classrooms = await Classroom.find({
            teacher_id: teacherId,
        }).lean()

        const classroomsWithStudents = await Promise.all(
            classrooms.map(async (classroom) => {
                const students = await ClassroomMember.find({
                    classroom_id: classroom._id,
                }).populate('user_id')
                return {
                    ...classroom,
                    students: students.map((cm) => cm.user_id.transform()),
                }
            }),
        )

        return res.status(httpStatus.OK).json({
            data: classroomsWithStudents,
            message: 'Lấy classrooms thành công',
        })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Lấy classrooms thất bại',
        })
    }
}

export const getClassroomByPage = async (req, res) => {
    try {
        let { page, perPage } = req.query
        if (!page || !perPage) {
            page = 1
            perPage = 10
        }
        const skip = (page - 1) * perPage
        const limit = parseInt(perPage, 10)

        const classrooms = await Classroom.find()
            .skip(skip)
            .limit(limit)
            .populate('teacher_id')

        const totalClassrooms = await Classroom.countDocuments()

        classrooms.forEach(classroom => {
            if (classroom.teacher_id) {
                classroom.teacher_id = classroom.teacher_id.transformUserInformation()
            }
        })

        return res.status(httpStatus.OK).json({
            data: classrooms,
            page: parseInt(page, 10),
            total: totalClassrooms,
            totalPages: Math.ceil(totalClassrooms / limit),
            message: 'Lấy danh sách classrooms thành công',
        })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Lấy danh sách classrooms thất bại',
        })
    }
}

export const getStudentsInClassroom = async (req, res) => {
    try {
        const { classroomId } = req.params
        const students = await ClassroomMember.find({
            classroom_id: classroomId,
        }).populate('user_id')

        return res.status(httpStatus.OK).json({
            data: students.map((cm) => cm.user_id.transform()),
            message: 'Lấy danh sách học sinh thành công',
        })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Lấy danh sách học sinh thất bại',
        })
    }
}

export const editClassroom = async (req, res) => {
    try {
        const { classroomId } = req.params
        const { name, description, teacher_id } = req.body

        const updatedClassroom = await Classroom.findByIdAndUpdate(
            classroomId,
            { name, description, teacher_id },
            { new: true },
        )

        if (!updatedClassroom) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy classroom',
            })
        }

        return res.status(httpStatus.OK).json({
            data: updatedClassroom,
            message: 'Cập nhật classroom thành công',
        })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Cập nhật classroom thất bại',
        })
    }
}

export const deleteClassroom = async (req, res) => {
    try {
        const { classroomId } = req.params

        const deletedClassroom = await Classroom.findByIdAndDelete(classroomId)

        if (!deletedClassroom) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy classroom',
            })
        }

        return res.status(httpStatus.OK).json({
            message: 'Xóa classroom thành công',
        })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Xóa classroom thất bại',
        })
    }
}

export const deleteStudentFromClassroom = async (req, res) => {
    try {
        const { classroomId, studentId } = req.params

        const classroom = await Classroom.findOne({ _id: classroomId })
        if (!classroom) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy classroom',
            })
        }

        const deletedMember = await ClassroomMember.findOneAndDelete({
            classroom_id: classroomId,
            user_id: studentId,
        })

        if (!deletedMember) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy học sinh trong classroom',
            })
        }

        return res.status(httpStatus.OK).json({
            message: 'Xóa học sinh khỏi classroom thành công',
        })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Xóa học sinh khỏi classroom thất bại',
        })
    }
}

export const addCourseToClassroom = async (req, res) => {
    try {
        const { classroomId, courseId } = req.body

        const classroom = await Classroom.findById(classroomId)
        if (!classroom) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy classroom',
            })
        }

        const course = await Course.findById(courseId)
        if (!course) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy course',
            })
        }

        if (classroom.courses.includes(courseId)) {
            return res.status(httpStatus.CONFLICT).json({
                message: 'Course đã có trong classroom',
            })
        }

        classroom.courses.push(courseId)
        await classroom.save()

        return res.status(httpStatus.OK).json({
            data: classroom,
            message: 'Thêm course vào classroom thành công',
        })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Thêm course vào classroom thất bại',
        })
    }
}

export const deleteCourseFromClassroom = async (req, res) => {
    try {
        const { classroomId, courseId } = req.body

        const classroom = await Classroom.findById(classroomId)
        if (!classroom) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy classroom',
            })
        }

        const courseIndex = classroom.courses.indexOf(courseId)
        if (courseIndex === -1) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy course trong classroom',
            })
        }

        classroom.courses.splice(courseIndex, 1)
        await classroom.save()

        return res.status(httpStatus.OK).json({
            data: classroom,
            message: 'Xóa course khỏi classroom thành công',
        })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Xóa course khỏi classroom thất bại',
        })
    }
}

export const getClassroomById = async (req, res) => {
    try {
        const { classroomId } = req.params

        const classroom = await Classroom.findById(classroomId).populate('teacher_id')

        if (!classroom) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy classroom',
            })
        }

        if (classroom.teacher_id) {
            classroom.teacher_id = classroom.teacher_id.transformUserInformation()
        }

        const students = await ClassroomMember.find({
            classroom_id: classroom._id,
        }).populate('user_id')

        const courses = await Course.find({
            _id: { $in: classroom.courses },
        })

        return res.status(httpStatus.OK).json({
            data: {
                ...classroom.toObject(),
                students: students.map((cm) => cm.user_id.transformUserInformation()),
                courses: courses,
            },
            message: 'Lấy classroom thành công',
        })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Lấy classroom thất bại',
        })
    }
}

import { PAGE, PER_PAGE } from '#constants/index'
import Project from '#models/project'
import { uploadImage } from '#utils/github'
import httpStatus from 'http-status'
import Favorite from '../models/favorite.model.js'
import { FAVOURITE_TYPE } from '../enums/favouriteType.enum.js'
import User from '../models/user.model.js'
import Forum from '../models/forum.model.js'
import LikeHistory from '../models/likeHistory.model.js'
import { LIKE_TYPE } from '../enums/likeType.enum.js'
import { PROJECT_TYPE } from '../enums/projectType.enum.js'
import { bool } from 'envalid'

export const getProjectById = async (req, res) => {
    try {
        const projectId = req.params.projectId
        const project = await Project.findById(projectId).populate('user_id')

        if (!project) {
            throw new Error('Project không tìm thấy')
        }

        if (project.user_id) {
            project.user_id = project.user_id.transformUserInformation()
        }

        project.view_count += 1
        await project.save()
        return res.status(httpStatus.OK).json({
            data: project,
            message: 'Lấy project thành công',
        })
    } catch (e) {
        return res.status(e.status || httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Không tìm thấy',
        })
    }
}

export const createProject = async (req, res) => {
    try {
        const { name, direction, code, description, createdBy, block } = req.body
        const user = await User.findById(createdBy)
        if (!user) {
            throw new Error('User không tồn tại')
        }
        let imageUrl = ''
        if (req.file) {
            imageUrl = await uploadImage(req, res, 'project')
        }

        const newProject = new Project({
            name: name,
            direction: direction,
            code: code,
            description: description,
            images: imageUrl,
            user_id: createdBy,
            updated_by: createdBy,
            block: block,
        })

        const savedProject = await newProject.save()

        return res.status(httpStatus.CREATED).json({
            data: savedProject,
            message: 'Tạo project thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Tạo project thất bại',
        })
    }
}

export const cloneProject = async (req, res) => {
    try {
        const { projectId, userId } = req.body

        const project = await Project.findById(projectId)
        if (!project) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Project không tồn tại',
            })
        }

        const newProject = new Project({
            name: project.name,
            direction: project.direction,
            code: project.code,
            description: project.description,
            images: project.images,
            user_id: userId,
            block: project.block,
        })
        const savedProject = await newProject.save()

        return res.status(httpStatus.CREATED).json({
            data: savedProject,
            message: 'Clone project thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Tạo project thất bại',
        })
    }
}

export const editProject = async (req, res) => {
    try {
        const projectId = req.params.projectId
        const { name, direction, code, description, updatedBy, block, images } = req.body
        let imageUrl = ""
        let newImages = false
        if (req.file) {
            imageUrl = await uploadImage(req, res, 'project')
            newImages = true
        }
        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            {
                name: name,
                direction: direction,
                code: code,
                description: description,
                images: newImages ? imageUrl : images,
                updated_by: updatedBy,
                block: block,
            },
            { new: true },
        )

        if (!updatedProject) {
            throw new Error('Project không tìm thấy')
        }

        return res.status(httpStatus.OK).json({
            data: updatedProject,
            message: 'Cập nhật project thành công',
        })
    } catch (e) {
        return res.status(e.status || httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Cập nhật project thất bại',
        })
    }
}

export const deleteProject = async (req, res) => {
    try {
        const projectId = req.params.projectId
        const deletedProject = await Project.findByIdAndDelete(projectId)

        if (!deletedProject) {
            throw new Error('Project không tìm thấy')
        }

        return res.status(httpStatus.OK).json({
            message: 'Xóa project thành công',
        })
    } catch (e) {
        return res.status(e.status || httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Xóa project thất bại',
        })
    }
}

export const getProjectsPerPage = async (req, res) => {
    try {
        let { page, perPage, name } = req.query
        if (!page || !perPage) {
            page = PAGE
            perPage = PER_PAGE
        }
        const skip = (page - 1) * perPage
        const limit = parseInt(perPage, 10)

        // Build the search query
        const searchQuery = name
            ? { name: { $regex: name, $options: 'i' } } // Case-insensitive search by name
            : {}

        const projects = await Project.find(searchQuery).skip(skip).limit(limit).populate('user_id')
        const totalProjects = await Project.countDocuments(searchQuery)

        projects.forEach((project) => {
            if (project.user_id) {
                project.user_id = project.user_id.transformUserInformation()
            }
        })

        return res.status(httpStatus.OK).json({
            data: projects,
            page: parseInt(page, 10),
            total: totalProjects,
            totalPages: Math.ceil(totalProjects / limit),
            message: 'Lấy danh sách projects thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Lấy danh sách projects thất bại',
        })
    }
}

export const getListProjectsByName = async (req, res) => {
    try {
        let { page, perPage, name, is_mine, user_id } = req.query
        if (!page || !perPage) {
            page = PAGE
            perPage = PER_PAGE
        }
        const skip = (page - 1) * perPage
        const limit = parseInt(perPage, 10)

        is_mine = is_mine === 'true' ? true : false

        // Build the search query
        const searchQuery = name
            ? { name: { $regex: name, $options: 'i' } } // Case-insensitive search by name
            : {}

        let projects, totalProjects, message

        if (is_mine) { // tim kiem prj cua toi
            searchQuery.user_id = user_id
            projects = await Project.find(searchQuery).skip(skip).limit(limit).populate('user_id')
            totalProjects = await Project.countDocuments(searchQuery)
            message = 'Lấy danh sách projects của tôi thành công'
        } else if (user_id) { //tim kiem prj da luu
            const favorite = await Favorite.find({
                user_id: user_id,
                object_type: FAVOURITE_TYPE.PROJECT,
            })

            const projectIds = favorite.map((item) => item.object_id)
            projects = await Project.find({ _id: { $in: projectIds } })
                .skip(skip)
                .limit(limit)
                .populate('user_id')
            totalProjects = projectIds.length
            message = 'Lấy danh sách projects đã lưu thành công'
        } else {
            projects = await Project.find(searchQuery).skip(skip).limit(limit).populate('user_id')
            totalProjects = await Project.countDocuments(searchQuery)
            message = 'Lấy danh sách projects bình thươờng thành công'
        }

        projects.forEach((project) => {
            if (project.user_id) {
                project.user_id = project.user_id.transformUserInformation()
            }
        })

        return res.status(httpStatus.OK).json({
            data: projects,
            page: parseInt(page, 10),
            total: totalProjects,
            totalPages: Math.ceil(totalProjects / limit),
            message: message,
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Lấy danh sách projects thất bại',
        })
    }
}

export const getProjectsByUserId = async (req, res) => {
    try {
        const { userId } = req.params
        let { page, perPage } = req.query
        if (!page || !perPage) {
            page = PAGE
            perPage = PER_PAGE
        }
        const skip = (page - 1) * perPage
        const limit = parseInt(perPage,   10)

        const projects = await Project.find({ user_id: userId }).skip(skip).limit(limit)
        const totalProjects = await Project.countDocuments({ user_id: userId })

        return res.status(httpStatus.OK).json({
            data: projects,
            page: parseInt(page, 10),
            total: totalProjects,
            totalPages: Math.ceil(totalProjects / limit),
            message: 'Lấy danh sách projects thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Lấy danh sách projects thất bại',
        })
    }
}

export const addProjectToFavorites = async (req, res) => {
    try {
        const { userId, projectId } = req.body

        const checkFavourite = await Favorite.findOne({
            user_id: userId,
            object_id: projectId,
            object_type: FAVOURITE_TYPE.PROJECT,
        })

        let savedFavorite, message

        if (checkFavourite) {
            savedFavorite = await Favorite.findByIdAndDelete(checkFavourite._id)
            message = 'Project removed from favorites successfully'
        } else {
            const newFavorite = new Favorite({
                user_id: userId,
                object_id: projectId,
                object_type: FAVOURITE_TYPE.PROJECT,
            })
            savedFavorite = await newFavorite.save()
            message = 'Project added to favorites successfully'
        }

        return res.status(httpStatus.CREATED).json({
            data: savedFavorite,
            message: message
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Failed to add/remove project from favorites',
        })
    }
}

export const getFavoriteProjects = async (req, res) => {
    try {
        const { userId } = req.query

        let { page, perPage } = req.query

        page = page || PAGE
        perPage = perPage || PER_PAGE

        const skip = (page - 1) * perPage
        const limit = parseInt(perPage, 10)

        const favorite = await Favorite.find({
            user_id: userId,
            object_type: FAVOURITE_TYPE.PROJECT,
        })

        const projectIds = favorite.map((item) => item.object_id)
        const projects = await Project.find({ _id: { $in: projectIds } })
            .skip(skip)
            .limit(limit)

        return res.status(httpStatus.OK).json({
            data: projects,
            message: 'Favorite projects retrieved successfully',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Failed to retrieve favorite projects',
        })
    }
}

export const likeProject = async (req, res) => {
    try {
        const { projectId, userId } = req.body

        const project = await Project.findById(projectId)
        if (!project) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Forum not found',
            })
        }

        const user = await User.findById(userId)
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'User not found',
            })
        }

        const likeHistory = await LikeHistory.findOne({
            user_id: userId,
            liketable_id: projectId,
            liketable_type: LIKE_TYPE.PROJECT,
        })

        if (likeHistory) {
            project.like_count -= 1
            await project.save()
            await LikeHistory.deleteOne({ _id: likeHistory._id })

            return res.status(httpStatus.OK).json({
                data: project,
                message: 'Project unliked successfully',
            })
        } else {
            project.like_count += 1
            await project.save()
            await LikeHistory.create({
                user_id: userId,
                liketable_id: projectId,
                liketable_type: LIKE_TYPE.PROJECT,
            })

            return res.status(httpStatus.OK).json({
                data: project,
                message: 'Project liked successfully',
            })
        }
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Failed to like/unlike project',
        })
    }
}

export const isLikedProject = async (req, res) => {
    try {
        const { projectId, userId } = req.body

        const likeHistory = await LikeHistory.findOne({
            user_id: userId,
            liketable_id: projectId,
            liketable_type: LIKE_TYPE.PROJECT,
        })

        return res.status(httpStatus.OK).json({
            data: !!likeHistory,
            message: 'Check liked project successfully',
        })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Failed to check liked project',
        })
    }
}

export const setTypeProject = async (req, res) => {
    try {
        const { projectId, type } = req.body

        const project = await Project.findById(projectId)
        if (!project) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Project not found',
            })
        }
        if (!Object.values(PROJECT_TYPE).includes(type)) {
            return res.status(httpStatus.BAD_REQUEST).json({
                message: 'Invalid type project',
            })
        }

        project.project_type = type
        await project.save()
        return res.status(httpStatus.OK).json({
            data: project,
            message: 'Set type project successfully',
        })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Failed to set type project',
        })
    }
}

export const getProjectsByType = async (req, res) => {
    try {
        const { type } = req.params

        if (!Object.values(PROJECT_TYPE).includes(type)) {
            return res.status(httpStatus.BAD_REQUEST).json({
                message: 'Invalid type project',
            })
        }

        const projects = await Project.find({ project_type: type }).populate('user_id')

        projects.forEach((project) => {
            if (project.user_id) {
                project.user_id = project.user_id.transformUserInformation()
            }
        })

        return res.status(httpStatus.OK).json({
            data: projects,
            message: 'Get projects by type successfully',
        })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Failed to get projects by type',
        })
    }
}

//search project and pagination


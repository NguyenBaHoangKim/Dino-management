import Forum from '#models/forum'
import { uploadImage } from '#utils/github'
import httpStatus from 'http-status'
import { PAGE, PER_PAGE } from '#constants/index'
import { LIKE_TYPE } from '../enums/likeType.enum.js'
import LikeHistory from '../models/likeHistory.model.js'
import User from '../models/user.model.js'
import Comment from '../models/comment.model.js'

export const createForum = async (req, res) => {
    try {
        const { title, description, userId } = req.body
        const imageUrl = await uploadImage(req, res, 'forum')

        const user = await User.findById(userId)
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy user',
            })
        }

        const newForum = new Forum({
            title: title,
            description: description,
            user_id: userId,
            images: imageUrl,
        })

        const savedForum = await newForum.save()

        return res.status(httpStatus.CREATED).json({
            data: savedForum,
            message: 'Tạo forum thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Tạo forum thất bại',
        })
    }
}

export const editForum = async (req, res) => {
    try {
        const forumId = req.params.forumId
        const { title, description } = req.body
        const imageUrl = await uploadImage(req, res, 'forum')

        const updatedForum = await Forum.findByIdAndUpdate(
            forumId,
            {
                title,
                description,
                images: imageUrl,
            },
            { new: true },
        )

        if (!updatedForum) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy forum',
            })
        }

        return res.status(httpStatus.OK).json({
            data: updatedForum,
            message: 'Cập nhật forum thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Cập nhật forum thất bại',
        })
    }
}

export const deleteForum = async (req, res) => {
    try {
        const forumId = req.params.forumId
        const deletedForum = await Forum.findByIdAndDelete(forumId)

        if (!deletedForum) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy forum',
            })
        }

        // Delete all comments associated with the forum
        await Comment.deleteMany({ commentable_id: forumId, commentable_type: 'FORUM' })

        return res.status(httpStatus.OK).json({
            message: 'Xóa forum thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Xóa forum thất bại',
        })
    }
}

export const getForumById = async (req, res) => {
    try {
        const forumId = req.params.forumId
        const forum = await Forum.findById(forumId)

        if (!forum) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy forum',
            })
        }

        forum.view_count += 1
        await forum.save()

        return res.status(httpStatus.OK).json({
            data: forum,
            message: 'Lấy forum thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Không tìm thấy forum',
        })
    }
}

export const getForumsByUserId = async (req, res) => {
    try {
        const { userId } = req.params
        const forums = await Forum.find({ user_id: userId })

        return res.status(httpStatus.OK).json({
            data: forums,
            message: 'Lấy danh sách forums thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Lấy danh sách forums thất bại',
        })
    }
}

export const getListForums = async (req, res) => {
    try {
        let { page, perPage } = req.query
        if (!page || !perPage) {
            page = PAGE
            perPage = PER_PAGE
        }
        let forums, totalForums
        if (parseInt(perPage, 10) === -1) {
            forums = await Forum.find().populate('user_id')
            totalForums = forums.length
        } else {
            const skip = (page - 1) * perPage
            const limit = parseInt(perPage, 10)
            forums = await Forum.find().skip(skip).limit(limit).populate('user_id')
            totalForums = await Forum.countDocuments()
        }

        forums.forEach((forum) => {
            forum.user_id = forum.user_id.transformUserInformation()
        })

        return res.status(httpStatus.OK).json({
            data: forums,
            page: parseInt(page, 10),
            totalPages: perPage === -1 ? 1 : Math.ceil(totalForums / perPage),
            message: 'Lấy danh sách forums thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Lấy danh sách forums thất bại',
        })
    }
}

export const viewForum = async (req, res) => {
    try {
        const { forumId, viewCount } = req.body
        const forum = await Forum.findById(forumId)

        if (!forum) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy forum',
            })
        }
        const updatedForum = await Forum.findByIdAndUpdate({ _id: forumId }, { view_count: viewCount + 1 }, { new: true })

        return res.status(httpStatus.OK).json({
            data: updatedForum,
            message: 'View forum thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'View forum thất bại',
        })
    }
}

export const likeForum = async (req, res) => {
    try {
        const { forumId, userId } = req.body

        const forum = await Forum.findById(forumId)
        if (!forum) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Forum not found',
            })
        }

        const likeHistory = await LikeHistory.findOne({
            user_id: userId,
            liketable_id: forumId,
            liketable_type: LIKE_TYPE.FORUM,
        })

        if (likeHistory) {
            forum.like_count -= 1
            await forum.save()
            await LikeHistory.deleteOne({ _id: likeHistory._id })

            return res.status(httpStatus.OK).json({
                data: forum,
                message: 'Forum unliked successfully',
            })
        } else {
            forum.like_count += 1
            await forum.save()
            await LikeHistory.create({
                user_id: userId,
                liketable_id: forumId,
                liketable_type: LIKE_TYPE.FORUM,
            })

            return res.status(httpStatus.OK).json({
                data: forum,
                message: 'Forum liked successfully',
            })
        }
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Failed to like/unlike forum',
        })
    }
}
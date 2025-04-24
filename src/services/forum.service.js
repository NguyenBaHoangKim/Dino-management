import Forum from '#models/forum'
import { uploadImage } from '#utils/github'
import httpStatus from 'http-status'
import { PAGE, PER_PAGE } from '#constants/index'
import { LIKE_TYPE } from '../enums/likeType.enum.js'
import LikeHistory from '../models/likeHistory.model.js'
import User from '../models/user.model.js'
import Comment from '../models/comment.model.js'
import Repost from '../models/repost.model.js'

export const createForum = async (req, res) => {
    try {
        const { title, description, userId } = req.body
        const imageUrl = req.file ? await uploadImage(req, res, 'forum') : []

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
        const { title, description, image } = req.body

        let imageUrl = ""
        let newImages = false
        if (req.file) {
            imageUrl = await uploadImage(req, res, 'forum')
            newImages = true
        }

        const updatedForum = await Forum.findByIdAndUpdate(
            forumId,
            {
                title,
                description,
                images: newImages ? imageUrl : image,
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
        await Repost.deleteMany({ originalPost: forumId })
        await LikeHistory.deleteMany({ liketable_id: forumId, liketable_type: LIKE_TYPE.FORUM })

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

//cai nay lay cho admin
export const getListForums = async (req, res) => {
    try {
        let { page, perPage, name } = req.query
        if (!page || !perPage) {
            page = PAGE
            perPage = PER_PAGE
        }
        let forums, totalForums
        //find by name
        const searchFilter = name
            ? { title: { $regex: name, $options: 'i' } } // Case-insensitive search
            : {};

        if (parseInt(perPage, 10) === -1) {
            forums = await Forum.find(searchFilter).populate('user_id').sort({ createdAt: -1 })
        } else {
            const skip = (page - 1) * perPage
            const limit = parseInt(perPage, 10)
            forums = await Forum.find(searchFilter).skip(skip).limit(limit).populate('user_id').sort({ createdAt: -1 })
        }
        totalForums = await Forum.countDocuments(searchFilter)

        forums.forEach((forum) => {
            if (forum.user_id)
                forum.user_id = forum.user_id.transformUserInformation()
        })

        return res.status(httpStatus.OK).json({
            data: forums,
            page: parseInt(page, 10),
            total: totalForums,
            totalPages: perPage === -1 ? 1 : Math.ceil(totalForums / perPage),
            message: 'Lấy danh sách forums thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Lấy danh sách forums thất bại',
        })
    }
}

//nay la /userId/ de lay o trang chu
export const getListForumsBaseOnUserId = async (req, res) => {
    try {
        const { userId } = req.params
        let { page, perPage } = req.query
        if (!page || !perPage) {
            page = PAGE
            perPage = PER_PAGE
        }
        let forums, totalForums
        if (parseInt(perPage, 10) === -1) {
            forums = await Forum.find().sort({ createdAt: -1 }).populate('user_id')
            totalForums = forums.length
        } else {
            const skip = (page - 1) * perPage
            const limit = parseInt(perPage, 10)
            forums = await Forum.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate('user_id')
            totalForums = await Forum.countDocuments()
        }

        // forums.forEach((forum) => {
        //     if (forum.user_id)
        //         forum.user_id = forum.user_id.transformUserInformation()
        // })

        const forumsWithCounts = await Promise.all(forums.map(async (forum) => {
            const repostCount = await Repost.countDocuments({ originalPost: forum._id })
            if (forum.user_id) {
                forum.user_id = forum.user_id.transformUserInformation()
            }
            let is_liked = false
            let is_reposted = false
            if (userId) {
                const likeHistory = await LikeHistory.findOne({
                    user_id: userId,
                    liketable_id: forum._id,
                    liketable_type: LIKE_TYPE.FORUM,
                })
                is_liked = !!likeHistory

                const repost = await Repost.findOne({ originalPost: forum._id, user_id: userId })
                is_reposted = !!repost
            }
            return {
                ...forum.toObject(),
                repost_count: repostCount,
                is_liked: is_liked,
                is_reposted: is_reposted,
            }
        }))

        return res.status(httpStatus.OK).json({
            data: forumsWithCounts,
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

export const isLikedForum = async (req, res) => {
    try {
        const { forumId, userId } = req.body

        const likeHistory = await LikeHistory.findOne({
            user_id: userId,
            liketable_id: forumId,
            liketable_type: LIKE_TYPE.FORUM,
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

export const getListForumLikedByUserId = async (req, res) => {
    try {
        const { userId } = req.params

        const likedForums = await LikeHistory.find({ user_id: userId, liketable_type: LIKE_TYPE.FORUM })
        const forumIds = likedForums.map(likeHistory => likeHistory.liketable_id)

        const forums = await Forum.find({ _id: { $in: forumIds } }).populate('user_id', '_id username avatar')

        return res.status(httpStatus.OK).json({
            data: forums,
            message: 'Lấy danh sách forums đã thích thành công',
        })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Failed to get list forum liked by user',
        })
    }
}

export const repostAForum = async (req, res) => {
    try {
        const { forumId, userId, comment } = req.body

        const forum = await Forum.findById(forumId)
        if (!forum) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Forum not found',
            })
        }

        if (!userId) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'User not found',
            })
        }

        const existRepost = await Repost.findOne({ originalPost: forumId, user_id: userId })
        if (existRepost) {
            await Repost.deleteOne({ _id: existRepost._id })
            return res.status(httpStatus.OK).json({
                message: 'Repost removed successfully',
            })
        } else {
            const newRepost = new Repost({
                originalPost: forumId,
                user_id: userId,
                comment,
            })

            const savedRepost = await newRepost.save()
            forum.repost_count += 1
            await forum.save()

            return res.status(httpStatus.CREATED).json({
                data: savedRepost,
                message: 'Repost forum successfully',
            })
        }
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Failed to repost forum',
        })
    }
}

export const getRepostByUserId = async (req, res) => {
    try {
        const { userId } = req.params
        const reposts = await Repost.find({ user_id: userId }).populate({
            path: 'originalPost',
            populate: { path: 'user_id' },
        })

        const repostList = reposts.map(repost => repost.originalPost)

        reposts.forEach((repost) => {
            if (repost.originalPost.user_id)
                repost.originalPost.user_id = repost.originalPost.user_id.transformUserInformation()
        })

        return res.status(httpStatus.OK).json({
            data: repostList,
            message: 'Get reposts successfully',
        })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Failed to get reposts',
        })
    }
}

export const getListUserLikedForum = async (req, res) => {
    try {
        const { forumId } = req.params
        const likeHistories = await LikeHistory.find({
            liketable_id: forumId,
            liketable_type: LIKE_TYPE.FORUM,
        }).populate('user_id')

        const users = likeHistories.map((likeHistory) => likeHistory.user_id.transform())

        return res.status(httpStatus.OK).json({
            data: users,
            message: 'Lấy danh sách người dùng đã thích forum thành công',
        })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Failed to get list user liked forum',
        })
    }
}
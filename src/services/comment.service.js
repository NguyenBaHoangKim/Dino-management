import Comment from '#models/comment'
import httpStatus from 'http-status'
import { PAGE, PER_PAGE } from '#constants/index'
import LikeHistory from '../models/likeHistory.model.js'
import { LIKE_TYPE } from '../enums/likeType.enum.js'
import { COMMENT_TYPE } from '../enums/commentType.enum.js'
import Forum from '../models/forum.model.js'
import Project from '../models/project.model.js'
import Lesson from '../models/lesson.model.js'
import Course from '../models/course.model.js'
import { getSocketInstance, onlineUsers } from '#configs/socket'

export const createComment = async (req, res) => {
    try {
        const { content, commentableId, commentableType, userId, parentId } = req.body

        if (Object.values(COMMENT_TYPE).includes(commentableType) === false) {
            return res.status(httpStatus.BAD_REQUEST).json({
                message: 'Loại comment không hợp lệ',
            })
        }

        const newComment = new Comment({
            content: content,
            user_id: userId,
            commentable_id: commentableId,
            commentable_type: commentableType,
            parent_id: parentId,
        })

        let owner;
        if (commentableType === COMMENT_TYPE.FORUM) {
            const forum = await Forum.findById(commentableId)
            if (!forum) {
                return res.status(httpStatus.NOT_FOUND).json({
                    message: 'Không tìm thấy Forum',
                })
            }
            forum.comment_count += 1
            await forum.save()
            owner = forum.user_id.toString()
        } else if (commentableType === COMMENT_TYPE.PROJECT) {
            const project = await Project.findById(commentableId)
            if (!project) {
                return res.status(httpStatus.NOT_FOUND).json({
                    message: 'Không tìm thấy Project',
                })
            }
            project.comment_count += 1
            await project.save()
            owner = project.user_id.toString()
        } else if (commentableType === COMMENT_TYPE.LESSON) {
            const lesson = await Lesson.findById(commentableId)
            if (!lesson) {
                return res.status(httpStatus.NOT_FOUND).json({
                    message: 'Không tìm thấy Lesson',
                })
            }
            lesson.comment_count += 1
            await lesson.save()
            owner = lesson.user_id.toString()
        } else if (commentableType === COMMENT_TYPE.COURSE) {
            const course = await Course.findById(commentableId)
            if (!course) {
                return res.status(httpStatus.NOT_FOUND).json({
                    message: 'Không tìm thấy Course',
                })
            }
            course.comment_count += 1
            await course.save()
            owner = course.user_id.toString()
        }

        const io = getSocketInstance()


        const postOwnerSocketId = onlineUsers.get(owner);
        if (postOwnerSocketId) {
            io.to(postOwnerSocketId).emit('newNotification', 'New comment created o day nee')
        }

        // if (onlineUsers.has(owner.toString())) {
        //     const notification = {
        //         title: 'Có người vừa comment vào bài viết của bạn',
        //         message: 'Có người vừa comment vào bài viết của bạn',
        //         user_id: owner,
        //         notification_objectId: commentableId,
        //         notification_type: commentableType,
        //     }
        //     io.to(owner.toString()).emit('newNotification', notification)
        // }

        const savedComment = await newComment.save()
        await savedComment.populate('user_id')
        if (savedComment.parent_id) {
            savedComment.user_id = savedComment.user_id.transformUserInformation()
        }

        return res.status(httpStatus.CREATED).json({
            data: savedComment,
            message: 'Tạo Comment thành công',
        })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Không thể tạo Comment',
        })
    }
}

export const createSubComment = async (req, res) => {
    try {
        const { content, commentableId, commentableType, userId, parentId } =
            req.body

        const newSubComment = new Comment({
            content: content,
            user_id: userId,
            commentable_id: commentableId,
            commentable_type: commentableType,
            parent_id: parentId,
        })

        const savedSubComment = await newSubComment.save()

        // Emit event to notify users
        const io = req.app.get('socketio')
        io.emit('newSubComment', 'New sub-comment created o day nee')

        return res.status(httpStatus.CREATED).json({
            data: savedSubComment,
            message: 'Tạo sub-Comment thành công',
        })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Không thể tạo sub-Comment',
        })
    }
}

export const getAllComments = async (req, res) => {
    try {
        const comments = await Comment.find()

        return res.status(httpStatus.OK).json({
            data: comments,
            message: 'Lấy Comment thành công',
        })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Không thể lấy Comment',
        })
    }
}

export const getCommentsByCommentableId = async (req, res) => {
    try {
        const { commentableId } = req.params
        let { page, perPage } = req.query
        if (!page || !perPage) {
            page = PAGE
            perPage = PER_PAGE
        }

        page = parseInt(page, 10)
        perPage = parseInt(perPage, 10)

        const skip = (page - 1) * perPage
        const limit = perPage
        const comments = await Comment.find({ commentable_id: commentableId })
            .skip(skip)
            .limit(limit)

        if (!comments.length) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không có Comment nào cho đối tượng này',
            })
        }

        return res.status(httpStatus.OK).json({
            data: comments,
            page: page,
            totalPages: Math.ceil(comments.length / perPage),
            message: 'Lấy Comment thành công',
        })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Không thể lấy Comment',
        })
    }
}

export const getCommentByCommentableIdBySubComment = async (req, res) => {
    try {
        const { commentableId } = req.params
        let { page, perPage } = req.query
        if (!page || !perPage) {
            page = PAGE
            perPage = PER_PAGE
        }

        page = parseInt(page, 10)
        perPage = parseInt(perPage, 10)

        const skip = (page - 1) * perPage
        const limit = perPage

        const comments = await Comment.find({ commentable_id: commentableId })
            .skip(skip)
            .limit(limit)
            .populate('user_id')
            //.sort({ createdAt: -1 })

        const totalComments = await Comment.countDocuments({ commentable_id: commentableId })

        const commentMap = {}
        comments.forEach((comment) => {
            comment.user_id = comment.user_id.transformUserInformation()
            if (comment.parent_id) {
                if (!commentMap[comment.parent_id]) {
                    commentMap[comment.parent_id] = []
                }
                commentMap[comment.parent_id].push(comment)
            } else {
                if (!commentMap[comment._id]) {
                    commentMap[comment._id] = []
                }
                //commentMap[comment._id].push(comment);
            }
        })

        const structuredComments = comments
            .filter((comment) => !comment.parent_id)
            .map((comment) => ({
                ...comment.toObject(),
                sub_comments: commentMap[comment._id] || [],
            }))

        return res.status(httpStatus.OK).json({
            data: structuredComments,
            page,
            totalPages: perPage === -1 ? 1 : Math.ceil(totalComments / perPage),
            message: 'Lấy Comment cùng sub-Comment thành công',
        })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Không thể lấy Comment cùng sub-Comment',
        })
    }
}

export const getCommentById = async (req, res) => {
    try {
        const { commentId } = req.params
        const comment = await Comment.findById(commentId)

        if (!comment) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'khong tim thay Comment',
            })
        }

        return res.status(httpStatus.OK).json({
            data: comment,
            message: 'Da lay Comment thanh cong',
        })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Loi tim kiem comment',
        })
    }
}

export const editComment = async (req, res) => {
    try {
        const { commentId } = req.params
        const { content } = req.body

        const updatedComment = await Comment.findByIdAndUpdate(
            commentId,
            { content },
            { new: true },
        )

        if (!updatedComment) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy Comment',
            })
        }

        return res.status(httpStatus.OK).json({
            data: updatedComment,
            message: 'Cập nhật Comment thành công',
        })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Không thể cập nhật Comment',
        })
    }
}

export const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params
        const deletedComment = await Comment.findById(commentId)

        if (!deletedComment) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy Comment',
            })
        }

        // Check if it is a parent comment
        if (!deletedComment.parent_id) {
            await Comment.deleteMany({ parent_id: commentId })
        }
        await Comment.findByIdAndDelete(commentId)

        return res.status(httpStatus.OK).json({
            message: 'Xóa Comment thành công',
        })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Không thể xóa Comment',
        })
    }
}

export const likeComment = async (req, res) => {
    try {
        const { commentId, userId } = req.body

        const comment = await Comment.findById(commentId)
        if (!comment) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'khong tim thay Comment',
            })
        }

        const likeHistory = await LikeHistory.findOne({
            user_id: userId,
            liketable_id: commentId,
            liketable_type: LIKE_TYPE.FORUM,
        })

        if (likeHistory) {
            comment.like_count -= 1
            await comment.save()
            await LikeHistory.deleteOne({ _id: likeHistory._id })

            return res.status(httpStatus.OK).json({
                data: comment,
                message: 'comment unliked thanh cong',
            })
        } else {
            comment.like_count += 1
            await comment.save()

            const likeHistory = new LikeHistory({
                user_id: userId,
                liketable_id: commentId,
                liketable_type: LIKE_TYPE.FORUM,
            })
            await likeHistory.save()

            return res.status(httpStatus.OK).json({
                data: comment,
                message: 'like comment thanh cong',
            })
        }
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'khong the like/unlike comment',
        })
    }
}
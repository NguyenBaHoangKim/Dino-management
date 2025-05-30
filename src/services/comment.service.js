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
import SubComment from '../models/subComment.model.js'

export const createComment = async (req, res) => {
    try {
        const { content, commentableId, commentableType, userId, parentId } = req.body

        if (Object.values(COMMENT_TYPE).includes(commentableType) === false) {
            return res.status(httpStatus.BAD_REQUEST).json({
                message: 'Loại comment không hợp lệ',
            })
        }

        let newComment
        let message = 'Tạo Comment thành công'
        if (parentId) {
            newComment = new SubComment({
                content: content,
                user_id: userId,
                commentable_id: commentableId,
                commentable_type: commentableType,
                parent_id: parentId,
            })
            message = 'Tạo SubComment thành công'
        } else {
            newComment = new Comment({
                content: content,
                user_id: userId,
                commentable_id: commentableId,
                commentable_type: commentableType,
            })
        }

        const savedComment = await newComment.save()
        await savedComment.populate('user_id')
        if (savedComment.user_id) {
            savedComment.user_id = savedComment.user_id.transformUserInformation()
        }

        // Emit event to notify users
        let owner
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
        }
        // else if (commentableType === COMMENT_TYPE.LESSON) {
        //     const lesson = await Lesson.findById(commentableId)
        //     if (!lesson) {
        //         return res.status(httpStatus.NOT_FOUND).json({
        //             message: 'Không tìm thấy Lesson',
        //         })
        //     }
        //     lesson.comment_count += 1
        //     await lesson.save()
        //     owner = lesson.user_id.toString()
        // } else if (commentableType === COMMENT_TYPE.COURSE) {
        //     const course = await Course.findById(commentableId)
        //     if (!course) {
        //         return res.status(httpStatus.NOT_FOUND).json({
        //             message: 'Không tìm thấy Course',
        //         })
        //     }
        //     course.comment_count += 1
        //     await course.save()
        //     owner = course.user_id.toString()
        // }
        // const io = getSocketInstance()
        //
        //
        // const postOwnerSocketId = onlineUsers.get(owner);
        // if (postOwnerSocketId) {
        //     io.to(postOwnerSocketId).emit('newNotification', 'New comment created o day nee')
        // }
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

        return res.status(httpStatus.CREATED).json({
            data: savedComment,
            message: message,
        })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Không thể tạo Comment',
        })
    }
}

//dang dung cai nay
export const getCommentsByCommentableId = async (req, res) => {
    try {
        const { commentableId, userId } = req.params
        let { page, perPage } = req.query
        // if (!page || !perPage) {
        //     page = PAGE
        //     perPage = PER_PAGE
        // }
        page = page ? parseInt(page, 10) : PAGE
        perPage = perPage ? parseInt(perPage, 10) : PER_PAGE

        // page = parseInt(page, 10)
        // perPage = parseInt(perPage, 10)

        const skip = (page - 1) * perPage
        const limit = perPage

        const comments = await Comment.find({ commentable_id: commentableId })
            .skip(skip)
            .limit(limit)
            .populate('user_id')

        comments.forEach((cmt) => {
            if (cmt.user_id)
                cmt.user_id = cmt.user_id.transformUserInformation()
        })


        const totalComments = await Comment.countDocuments({ commentable_id: commentableId })

        const commentIds = comments.map(comment => comment._id)
        const subCommentsMap = {}

        for (const commentId of commentIds) {
            const subComments = await SubComment.find({ parent_id: commentId })
                .populate('user_id')
                .limit(5)

            subCommentsMap[commentId] = subComments.map(subComment => {
                if (subComment.user_id) {
                    subComment.user_id = subComment.user_id.transformUserInformation()
                }
                return subComment
            })
        }

        const structuredComments = comments.map(comment => ({
            ...comment.toObject(),
            sub_comments: subCommentsMap[comment._id] || [],
        }))

        return res.status(httpStatus.OK).json({
            data: structuredComments,
            page: page,
            totalPages: Math.ceil(totalComments / perPage),
            message: 'Lấy Comment thành công',
        })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Không thể lấy Comment',
        })
    }
}

export const getNguyenComment = async (req, res) => {
    try {
        const { commentableId, userId } = req.body
        let { page, perPage } = req.query

        page = page ? parseInt(page, 10) : PAGE
        perPage = perPage ? parseInt(perPage, 10) : PER_PAGE

        const skip = (page - 1) * perPage
        const limit = perPage

        const comments = await Comment.find({ commentable_id: commentableId })
            .skip(skip)
            .limit(limit)
            .populate('user_id', 'username avatar')

        const countComment = await Comment.countDocuments({ commentable_id: commentableId })

        // Add isLiked field to each comment
        const commentsWithIsLiked = await Promise.all(
            comments.map(async (comment) => {
                const likeHistory = await LikeHistory.findOne({
                    user_id: userId,
                    liketable_id: comment._id,
                    liketable_type: LIKE_TYPE.FORUM,
                })

                const countSubComment = await SubComment.countDocuments({ parent_id: comment._id })

                return {
                    ...comment.toObject(),
                    countSubComment: countSubComment,
                    isLiked: !!likeHistory, // true if likeHistory exists, false otherwise
                }
            }),
        )

        return res.status(httpStatus.OK).json({
            data: commentsWithIsLiked,
            page: page,
            totalPages: Math.ceil(countComment / perPage),
            message: 'Lấy Comment thành công',
        })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Không thể lấy Comment',
        })
    }
}

export const getNguyenSubComment = async (req, res) => {
    try {
        const { parentId, userId } = req.body
        let { page, perPage } = req.query

        page = page ? parseInt(page, 10) : PAGE
        perPage = perPage ? parseInt(perPage, 10) : PER_PAGE

        const skip = (page - 1) * perPage
        const limit = perPage

        const subComments = await SubComment.find({ parent_id: parentId })
            .skip(skip)
            .limit(limit)
            .populate('user_id', 'username avatar')

        const countSubComments = await SubComment.countDocuments({ parent_id: parentId })

        // Add isLiked field to each subcomment
        const subCommentsWithIsLiked = await Promise.all(
            subComments.map(async (subComment) => {
                const likeHistory = await LikeHistory.findOne({
                    user_id: userId,
                    liketable_id: subComment._id,
                    liketable_type: LIKE_TYPE.FORUM,
                })

                return {
                    ...subComment.toObject(),
                    isLiked: !!likeHistory, // true if likeHistory exists, false otherwise
                }
            }),
        )

        return res.status(httpStatus.OK).json({
            data: subCommentsWithIsLiked,
            page: page,
            totalPages: Math.ceil(countSubComments / perPage),
            message: 'Lấy SubComment thành công',
        })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Không thể lấy SubComment',
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

//cai cu k dung nua
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
            data: comments,
            page: page,
            totalPages: perPage === -1 ? 1 : Math.ceil(structuredComments.length / perPage),
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
        const deletedComment = await Comment.findByIdAndDelete(commentId)
        const deletedSubComment = await SubComment.findByIdAndDelete(commentId)

        if (!deletedComment && !deletedSubComment) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy Comment',
            })
        }

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
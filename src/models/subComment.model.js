import mongoose from 'mongoose'
import BaseModel from '#models/base'
import { COMMENT_TYPE } from '#enums/commentType'

const subCommentSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true,
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        commentable_type: {
            type: String,
            enum: COMMENT_TYPE,
            required: true,
        },
        commentable_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        parent_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
        },
        like_count: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    },
)

const baseModel = new BaseModel(subCommentSchema)

const SubComment = baseModel.createModel('SubComment')

export default SubComment

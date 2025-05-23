import mongoose from 'mongoose'
import BaseModel from '#models/base'
import { COMMENT_TYPE } from '#enums/commentType'

const commentSchema = new mongoose.Schema(
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
        like_count: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    },
)

const baseModel = new BaseModel(commentSchema)

const Comment = baseModel.createModel('Comment')

export default Comment

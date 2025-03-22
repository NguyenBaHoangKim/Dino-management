import mongoose from 'mongoose'
import BaseModel from '#models/base'

const forumSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        description: {
            type: String,
            trim: true,
        },
        images: {
            type: [String],
            default: [],
        },
        like_count: {
            type: Number,
            default: 0,
        },
        comment_count: {
            type: Number,
            default: 0,
        },
        view_count: {
            type: Number,
            default: 0,
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    },
)

const baseModel = new BaseModel(forumSchema)

const Forum = baseModel.createModel('Forum')

export default Forum

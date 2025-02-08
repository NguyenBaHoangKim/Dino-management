import mongoose from 'mongoose'
import BaseModel from '#models/base'
import { LIKE_TYPE } from '../enums/likeType.enum.js'

const RepostSchema = new mongoose.Schema(
    {
        originalPost: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Forum',
            required: true,
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        comment: {
            type: String,
            maxlength: 500,
        },
    },
    { timestamps: true }
);

const baseModel = new BaseModel(RepostSchema)

const Repost = baseModel.createModel('Repost')

export default Repost

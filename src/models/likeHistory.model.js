import mongoose from 'mongoose'
import BaseModel from '#models/base'
import { LIKE_TYPE } from '../enums/likeType.enum.js'

const likeHistorySchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        liketable_type: {
            type: String,
            enum: LIKE_TYPE,
            required: true,
        },
        liketable_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
    },
    { timestamps: true },
)

const baseModel = new BaseModel(likeHistorySchema)

const LikeHistory = baseModel.createModel('LikeHistory')

export default LikeHistory

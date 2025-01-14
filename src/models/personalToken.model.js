import mongoose from 'mongoose'
import BaseModel from '#models/base'
import { TOKEN_TYPE } from '#enums/tokenType'

const personalTokenSchema = new mongoose.Schema(
    {
        token_type: {
            type: String,
            enum: TOKEN_TYPE,
            default: TOKEN_TYPE.ACCESS_TOKEN,
        },
        user_email: {
            type: String,
            required: true,
            trim: true,
        },
        token: {
            type: String,
            required: true,
            trim: true,
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        expires_at: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    },
)

const baseModel = new BaseModel(personalTokenSchema)

const PersonalToken = baseModel.createModel('PersonalToken')

export default PersonalToken

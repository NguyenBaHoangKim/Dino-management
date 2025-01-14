import mongoose from 'mongoose'
import BaseModel from '#models/base'

const sessionSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        ip_address: {
            type: String,
            trim: true,
        },
        user_agent: {
            type: String,
            trim: true,
        },
        data: {
            type: String,
            trim: true,
        },
        last_activity: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    },
)

const baseModel = new BaseModel(sessionSchema)

const Session = baseModel.createModel('Session')

export default Session

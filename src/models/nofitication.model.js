import mongoose from 'mongoose'
import BaseModel from '#models/base'

const notificationSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
    },
    {
        timestamps: true,
    },
)

const baseModel = new BaseModel(notificationSchema)

const Notification = baseModel.createModel('Notification')

export default Notification

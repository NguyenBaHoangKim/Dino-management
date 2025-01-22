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
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        is_read: {
            type: Boolean,
            default: false,
        },
        notification_objectId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        notification_type: {
            type: String,
        }
    },
    {
        timestamps: true,
    },
)

const baseModel = new BaseModel(notificationSchema)

const Notification = baseModel.createModel('Notification')

export default Notification

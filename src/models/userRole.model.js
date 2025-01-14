import mongoose from 'mongoose'
import BaseModel from '#models/base'

// bang phu k can xoa sau
const userRoleSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        role_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Role',
            required: true,
        },
    },
    {
        timestamps: true,
    },
)

const baseModel = new BaseModel(userRoleSchema)

const UserRole = baseModel.createModel('UserRole')

export default UserRole

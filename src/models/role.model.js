import mongoose from 'mongoose'
import BaseModel from '#models/base'
import { ROLE } from '#enums/role'

const roleSchema = new mongoose.Schema(
    {
        role_name: {
            type: String,
            enum: ROLE,
            default: ROLE.GUESS,
            required: true,
        },
        code: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    },
)

const baseModel = new BaseModel(roleSchema)

const Role = baseModel.createModel('Role')

export default Role

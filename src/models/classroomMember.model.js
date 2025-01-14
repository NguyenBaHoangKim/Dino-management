import BaseModel from './base.model.js'
import mongoose from 'mongoose'

const classroomMemberSchema = new mongoose.Schema(
    {
        classroom_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Classroom',
            required: true,
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        // role_id: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'Role',
        //     required: true,
        // },
    },
    { timestamps: true },
)

const baseModel = new BaseModel(classroomMemberSchema)

const ClassroomMember = baseModel.createModel('ClassroomMember')

export default ClassroomMember

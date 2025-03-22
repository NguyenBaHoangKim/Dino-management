import BaseModel from './base.model.js'
import mongoose from 'mongoose'

const courseMemberSchema = new mongoose.Schema(
    {
        course_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true },
)

const baseModel = new BaseModel(courseMemberSchema)

const CourseMember = baseModel.createModel('CourseMember')

export default CourseMember

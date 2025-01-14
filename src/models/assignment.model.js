import mongoose from 'mongoose'
import BaseModel from '#models/base'
import { ASSIGNMENT_TYPE } from '../enums/assignmentType.enum.js'

const assignmentSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        description: {
            type: String,
            trim: true,
        },
        due_date: {
            type: Date,
            required: true,
        },
        startDate: {
            type: Date,
        },  
        endDate: {
            type: Date,
        },
        type: {
            type: String,
            enum: ASSIGNMENT_TYPE,
            required: true,
        },
        referenceId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'type',
        },
    },
    {
        timestamps: true,
    },
)

const baseModel = new BaseModel(assignmentSchema)

const Assignment = baseModel.createModel('Assignment')

export default Assignment

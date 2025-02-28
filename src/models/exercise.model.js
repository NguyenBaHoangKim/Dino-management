import mongoose from 'mongoose'
import BaseModel from './base.model.js'

const exerciseSchema = new mongoose.Schema(
    {
        lesson_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lesson',
            required: true,
        },
        type: {
            type: String,
            default: 'text',
        },
        description: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        time: {
            type: Number,
            required: true,
        },
        end_date: {
            type: Date,
        },
    },
    {
        timestamps: true,
    },
)

const baseModel = new BaseModel(exerciseSchema)

const Exercise = baseModel.createModel('Exercise')

export default Exercise

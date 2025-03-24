import mongoose from 'mongoose'
import BaseModel from '#models/base'
import { ROLE } from '#enums/role'

const scoreSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        course_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
        },
        exercise_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Exercise',
            required: true,
        },
        lesson_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lesson',
            required: true,
        },
        score: {
            type: Number,
            default: 0,
            min: 0,
            max: 10,
        },
    },
    {
        timestamps: true,
    },
)

const baseModel = new BaseModel(scoreSchema)

const Score = baseModel.createModel('Score')

export default Score

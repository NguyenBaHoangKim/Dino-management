import mongoose from 'mongoose'
import BaseModel from './base.model.js'

const answerSchema = new mongoose.Schema(
    {
        question_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question',
            required: true,
        },
        lesson_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lesson',
            required: true,
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        answer: {
            type: String,
            default: '',
        },
        is_correct: {
            type: Boolean,
            required: true,
        },
    },
    {
        timestamps: true,
    },
)

const baseModel = new BaseModel(answerSchema)

const Answer = baseModel.createModel('Answer')

export default Answer

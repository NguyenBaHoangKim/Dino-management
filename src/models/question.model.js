import mongoose from 'mongoose'
import BaseModel from './base.model.js'

const questionSchema = new mongoose.Schema(
    {
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
        question: {
            type: String,
            required: true,
        },
        answers: {
            type: [String],
            required: true,
        },
        correct_answer: {
            type: [String],
            required: true,
        },
        index: {
            type: Number,
            required: true,
        },
        image: {
            type: String,
            default: '',
        },
        type_answer: {
            type: String,
            default: 'default',
        },
    },
    {
        timestamps: true,
    },
)

const baseModel = new BaseModel(questionSchema)

const Question = baseModel.createModel('Question')

export default Question

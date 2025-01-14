import mongoose from 'mongoose'
import BaseModel from '#models/base'
import { LESSON_STATUS } from '#enums/statusLesson'

const lessonSchema = new mongoose.Schema(
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
        video_url: {
            type: String,
            trim: true,
        },
        images: {
            type: [String],
            default: [],
        },
        view_count: {
            type: Number,
            default: 0,
        },
        body: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: LESSON_STATUS,
            default: LESSON_STATUS.DRAFT,
        },
        course_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
        },
    },
    {
        timestamps: true,
    },
)

const baseModel = new BaseModel(lessonSchema)

const Lesson = baseModel.createModel('Lesson')

export default Lesson

import mongoose from 'mongoose'
import BaseModel from '#models/base'
import { COURSE_TYPE } from '../enums/courseType.enum.js'
import { IMAGE } from '#constants/index'

const courseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50,
        },
        description: {
            type: String,
            trim: true,
            maxlength: 200,
        },
        start_date: {
            type: Date, // Using Date for timestamps
            required: true,
        },
        end_date: {
            type: Date,
            required: true,
        },
        images: {
            type: [String],
            default: [IMAGE.logo],
        },
        certification: {
            type: String,
            trim: true,
            maxlength: 200,
        },
        teacher_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        course_type: {
            type: String,
            enum: COURSE_TYPE,
            default: COURSE_TYPE.DEFAULT,
        },
    },
    {
        timestamps: true,
    },
)

courseSchema.method({
    transform() {
        const transformed = {}
        const fields = ['_id', 'title', 'description', 'start_date', 'end_date', 'certification', 'images']

        for (const field of fields) {
            transformed[field] = this[field]
        }

        return transformed
    },
})

const baseModel = new BaseModel(courseSchema)

const Course = baseModel.createModel('Course')

export default Course

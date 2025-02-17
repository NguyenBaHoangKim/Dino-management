import mongoose from 'mongoose'
import BaseModel from '#models/base'

const classroomSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50,
        },
        description: {
            type: String,
            required: false,
        },
        teacher_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        image: {
            type: [String],
            default: [],
        },
        courses: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'Course',
            default: [],
        },
    },
    {
        timestamps: true,
    },
)

classroomSchema.method({
    transform() {
        const transformed = {}
        const fields = ['_id', 'name', 'description', 'teacher_id', 'courses', 'students']

        for (const field of fields) {
            transformed[field] = this[field]
        }

        return transformed
    },
})

const baseModel = new BaseModel(classroomSchema)

const Classroom = baseModel.createModel('Classroom')

export default Classroom

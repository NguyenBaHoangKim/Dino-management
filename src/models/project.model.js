import mongoose from 'mongoose'
import BaseModel from '#models/base'
import { PROJECT_TYPE } from '../enums/projectType.enum.js'

const projectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50,
        },
        direction: {
            type: String,
            //required: true,
        },
        code: {
            type: String,
            //required: true,
        },
        like_count: {
            type: Number,
            default: 0,
        },
        view_count: {
            type: Number,
            default: 0,
        },
        description: {
            type: String,
        },
        images: {
            type: [String],
            default: [],
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        project_type: {
            type: String,
            enum: PROJECT_TYPE,
            default: PROJECT_TYPE.DEFAULT,
            required: true,
        },

        block: {
            type: Object, // Hoặc mongoose.Schema.Types.Mixed nếu muốn lưu mọi loại dữ liệu
            default: null, // Để mặc định là null khi không có block
        },
        // project_type: {
        //     type: [String],
        //     enum: PROJECT_TYPE,
        //     default: [PROJECT_TYPE.DEFAULT],
        //     required: true,
        // },
    },
    {
        timestamps: true,
    },
)

// Create the model
const baseModel = new BaseModel(projectSchema)
const Project = baseModel.createModel('Project')
//const Project = mongoose.model('Project', projectSchema);

export default Project

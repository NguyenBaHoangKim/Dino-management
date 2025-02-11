import mongoose from 'mongoose'
import BaseModel from './base.model.js'

const CodeSchema = new mongoose.Schema(
    {
        javascriptCode: {
            type: String,
            default: '',
        },
        jsonCode: {
            type: Object,
            default: {},
        },
        xmlCode: {
            type: String,
            default: '',
        },
    },
    { timestamps: true },
)


const baseModel = new BaseModel(CodeSchema)

const CodeBlock = baseModel.createModel('CodeBlock')

export default CodeBlock

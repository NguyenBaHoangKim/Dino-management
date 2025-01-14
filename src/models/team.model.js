import mongoose from 'mongoose'
import BaseModel from '#models/base'

const teamSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        leader_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    },
)

const baseModel = new BaseModel(teamSchema)

const Team = baseModel.createModel('Team')

export default Team

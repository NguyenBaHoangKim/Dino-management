import mongoose from 'mongoose'
import BaseModel from '#models/base'

const teamMemberSchema = new mongoose.Schema(
    {
        team_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team',
            required: true,
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    },
)

const baseModel = new BaseModel(teamMemberSchema)

const TeamMember = baseModel.createModel('TeamMember')

export default TeamMember

import mongoose from 'mongoose'
import BaseModel from '#models/base'
import { FAVOURITE_TYPE } from '../enums/favouriteType.enum.js'

const favoriteSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        object_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        object_type: {
            type: String,
            enum: FAVOURITE_TYPE,
            required: true,
        },
    },
    { timestamps: true },
)

const baseModel = new BaseModel(favoriteSchema)

const Favorite = baseModel.createModel('Favorite')

export default Favorite

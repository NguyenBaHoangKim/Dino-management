import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import config from '#configs/environment'
import BaseModel from '#models/base'
import { ROLES } from '#constants/role'

const { env } = config
const roles = ['user', 'admin', 'student', 'teacher', 'principal', 'admin_web']

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            match: /^\S+@\S+\.\S+$/,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            maxlength: 128,
        },
        username: {
            type: String,
            maxlength: 128,
            required: true,
            index: true,
            trim: true,
        },
        services: {
            facebook: String,
            google: String,
        },
        role: {
            type: String,
            required: true,
            enum: Object.values(ROLES),
            default: ROLES.USER,
        },
        avatar: {
            type: [String],
            default: [],
        },
        birthday: {
            type: Date,
            default: new Date('2000-01-01'),
        },
        phoneNumber: {
            type: String,
            default: '',
        },
        accessToken: {
            type: String,
            trim: true,
        },
        refreshToken: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    },
)

userSchema.pre('save', async function save(next) {
    try {
        if (!this.isModified('password')) return next()

        const rounds = env === 'test' ? 1 : 10

        this.password = await bcrypt.hash(this.password, rounds)

        return next()
    } catch (error) {
        return next(error)
    }
})

userSchema.method({
    transform() {
        const transformed = {}
        const fields = ['_id', 'username', 'email', 'avatar', 'role', 'birthday', 'phoneNumber', 'createdAt', 'updatedAt']

        for (const field of fields) {
            transformed[field] = this[field]
        }

        return transformed
    },

    transformUserInformation() {
        const transformed = {}
        const fields = ['_id', 'username', 'avatar']
        for (const field of fields) {
            transformed[field] = this[field]
        }
        return transformed
    },

    async passwordMatches(password) {
        // @ts-ignore
        return bcrypt.compare(password, this.password)
    },
})

userSchema.statics = {
    // @ts-ignore
    roles,
    async oAuthLogin({ service, id, email, name, picture }) {
        const user = await this.findOne({ $or: [{ [`services.${service}`]: id }, { email }] })
        if (user) {
            user.services[service] = id
            if (!user.username) user.username = name
            if (!user.avatar) user.avatar = picture
            return user.save()
        }
        const password = randomUUID()
        return this.create({
            services: { [service]: id },
            email,
            password,
            username: name,
            avatar: picture,
        })
    },

}

const baseModel = new BaseModel(userSchema)

const User = baseModel.createModel('User')

export default User
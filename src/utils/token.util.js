import { addDays } from 'date-fns'
import PersonalToken from '#models/personalToken'
import { TOKEN_TYPE } from '#enums/tokenType'

export const generatePasswordResetToken = async (user) => {
    const userId = user._id
    const userEmail = user.email
    // @ts-ignore
    const token = `${userId}.${crypto.randomBytes(40).toString('hex')}`
    const expires = addDays(Date.now(), 30)
    const token_type = TOKEN_TYPE.PASSWORD_RESET_TOKEN
    const tokenObject = new PersonalToken({
        token_type: token_type,
        token: token,
        user_id: userId,
        user_email: userEmail,
        expires_at: expires,
    })
    await tokenObject.save()
    return tokenObject
}
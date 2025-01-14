import passport from 'passport'
import BearerStrategy from 'passport-http-bearer'
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt'
import config from '#configs/environment'
import User from '#models/user'
import * as authProviders from '#securities/oauth2/oAuth2'

const jwtOptions = {
    secretOrKey: config.auth.jwtSecret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
}

async function jwtHandler(payload, done) {
    try {
        const user = await User.findById(payload._id)
        if (user) return done(null, user)
        return done(null, false)
    } catch (error) {
        return done(error, false)
    }
}

function oAuthHandler(service) {
    return async (token, done) => {
        try {
            const userData = await authProviders[service](token)
            const user = await User.oAuthLogin(userData)
            return done(null, user)
        } catch (err) {
            return done(err)
        }
    }
}

const authMiddleware = passport.initialize()

passport.use('jwt', new JwtStrategy(jwtOptions, jwtHandler))
passport.use('google', new BearerStrategy(oAuthHandler('google')))

export default authMiddleware
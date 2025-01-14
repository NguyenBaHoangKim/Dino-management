import nodemailer from 'nodemailer'
import config from '#configs/environment'

const transport = nodemailer.createTransport({
    port: config.email.port,
    host: config.email.host,
    auth: {
        user: config.email.username,
        pass: config.email.password,
    },
    secure: false,
})

export const verifyConnection = () => Promise.resolve(true)

export default transport
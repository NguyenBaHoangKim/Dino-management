import Email from 'email-templates'
import config from '#configs/environment'
import transport from '#configs/email'
import logger from '#configs/logger'

export async function sendPasswordReset(passwordResetObject) {
    const email = new Email({
        transport,
        views: { root: config.appPath },
        message: {
            from: 'support@block-arduino.com',
        },
        send: true,
    })

    try {
        await email.send({
            template: 'password-reset',
            message: {
                to: passwordResetObject.userEmail,
            },
            locals: {
                productName: 'Block Arduino',
                passwordResetUrl: `http://localhost:3000/new-password/view?resetToken=${passwordResetObject.resetToken}`,
            },
        })
    } catch (err) {
        logger.error({ err, msg: 'error sending password reset email:' })
    }
}

export async function sendPasswordChangeEmail(user) {
    const email = new Email({
        transport,
        views: { root: config.appPath },
        message: {
            from: 'support@block-arduino.com',
        },
        send: true,
    })

    try {
        await email.send({
            template: 'password-change',
            message: {
                to: user.email,
            },
            locals: {
                productName: 'Block Arduino',
                name: user.name,
            },
        })
    } catch (err) {
        logger.error({ err, msg: 'error sending change password email:' })
    }
}
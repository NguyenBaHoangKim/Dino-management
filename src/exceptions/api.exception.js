import httpStatus from 'http-status'
import ExtendableError from '#exceptions/extendable'

export default class APIError extends ExtendableError {
    constructor({
                    message,
                    errors,
                    stack,
                    status = httpStatus.INTERNAL_SERVER_ERROR,
                    isPublic = false,
                }) {
        super({
            message,
            errors,
            status,
            isPublic,
            stack,
        })
    }
}
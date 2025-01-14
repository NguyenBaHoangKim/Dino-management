import Session from '#models/session'
import httpStatus from 'http-status'

export const saveSession = async (req, res) => {
    try {
        const { user_id, ip_address, user_agent, data, last_activity } =
            req.body

        const newSession = new Session({
            user_id,
            ip_address,
            user_agent,
            data,
            last_activity,
        })

        const savedSession = await newSession.save()

        return res.status(httpStatus.CREATED).json({
            data: savedSession,
            message: 'Session saved successfully',
        })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Failed to save session',
        })
    }
}

export const getSessionByUserId = async (req, res) => {
    try {
        const { userId } = req.params
        const sessions = await Session.find({ user_id: userId })

        if (!sessions.length) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'No sessions found for this user',
            })
        }

        return res.status(httpStatus.OK).json({
            data: sessions,
            message: 'Sessions retrieved successfully',
        })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Failed to retrieve sessions',
        })
    }
}

import { saveSession, getSessionByUserId } from '#services/session'

export const saveSessionController = async (req, res) => {
    await saveSession(req, res)
}

export const getSessionByUserIdController = async (req, res) => {
    await getSessionByUserId(req, res)
}

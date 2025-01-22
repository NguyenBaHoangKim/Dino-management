import Notification from '../models/nofitication.model.js'
import httpStatus from 'http-status'

export const createNotification = async (req, res) => {
    try {
        const { title, message, user_id, notification_objectId, notification_type } = req.body

        const newNotification = new Notification({
            title,
            message,
            user_id,
            notification_objectId,
            notification_type,
        })

        const savedNotification = await newNotification.save()

        return res.status(httpStatus.CREATED).json({
            data: savedNotification,
            message: 'Tạo thông báo thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Tạo thông báo thất bại',
        })
    }
}
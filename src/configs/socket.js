import { Server } from 'socket.io'
import logger from '#configs/logger'

let io // Biến lưu trữ instance của Socket.IO
export const onlineUsers = new Map()

export function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: '*', // Cấu hình CORS
        },
    })

    // Lưu instance của Socket.IO để sử dụng trong toàn ứng dụng
    logger.info('Socket.IO has been initialized successfully')

    io.on('connection', (socket) => {
        logger.warn(`A user connected: ${socket.id}`)

        // Gửi thông điệp tới client
        socket.emit('message', `Hello ${socket.id}`)

        socket.on('join', (userId) => {
            onlineUsers.set(userId, socket.id)
            console.log(onlineUsers)
            logger.warn(`User ${userId} joined`)
        })


        // Lắng nghe sự kiện 'disconnect'
        socket.on('disconnect', () => {
            //onlineUsers.delete(socket.id)
            logger.warn(`User ${socket.id} disconnected`)
        })
    })
}

// Hàm để lấy instance của Socket.IO (nếu cần sử dụng ở nơi khác)
export function getSocketInstance() {
    if (!io) {
        throw new Error('Socket.IO is not initialized. Call initSocket first.')
    }
    return io
}

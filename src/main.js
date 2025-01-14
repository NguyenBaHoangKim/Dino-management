import http from 'node:http'
import { createTerminus } from '@godaddy/terminus'
import config from '#configs/environment'
import * as database from '#configs/database'
import * as email from '#configs/email'
import logger from '#configs/logger'
import app from '#configs/server'
import { Server as SocketIOServer } from 'socket.io';

const { port } = config
const server = http.createServer(app)
const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
    },
  });

  app.set('socketio', io);

export default async function main() {
    try {
        await startServer()
    } catch (err) {
        logger.fatal(err)
        process.exit(1)
    }
}

const users = {};

io.on('connection', (socket) => {
  logger.warn('A user connected: ' + socket.id);
  socket.emit('message', 'Hello ' + socket.id);

  socket.on('login', (data) => {
    logger.warn('User ' + data.userId + ' connected');
    // saving userId to object with socket ID
    users[socket.id] = data.userId;
  });

  socket.on('disconnect', () => {
    logger.warn('User ' + users[socket.id] + ' disconnected');
    // remove saved socket from users object
    delete users[socket.id];
    logger.warn('Socket disconnected: ' + socket.id);
  });
});


async function startServer() {
    setupErrorHandling()
    await database.connect(config.mongo.uri)
    await email.verifyConnection()

    createTerminus(server, {
        onSignal,
        onShutdown,
        signals: ['SIGINT', 'SIGTERM'],
        logger: (msg, err) => logger.error({ msg, err }),
        healthChecks: {
            '/health': onHealthCheck,
            __unsafeExposeStackTraces: !config.isProduction,
        },
    })

    server.listen(port, onListening)
}

function onListening() {
    logger.info({ msg: `listening on http://localhost:${port}` })
}

async function onSignal() {
    logger.info('server is starting cleanup')
    database
        .disconnect()
        .then(() => logger.info('database disconnected'))
        .catch(err => logger.error({ err, msg: 'error during disconnection' }))
}

async function onShutdown() {
    logger.info('cleanup finished, server is shutting down')
}

async function onHealthCheck() {
    await database.ping()
}

function setupErrorHandling() {
    process.on('unhandledRejection', (err, promise) => {
        logger.fatal({ err, msg: `Unhandled Rejection at: ${promise}` })
        process.exit(1)
    })

    process.on('uncaughtException', (err, origin) => {
        logger.fatal({ err, msg: `Uncaught Exception: ${err.message} at: ${origin}` })
        process.exit(1)
    })
}
import 'express-async-errors'
import bodyParser from 'body-parser'
import cors from 'cors'
import express from 'express'
import pino from 'express-pino-logger'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import logger from '#configs/logger'
import routes from '#routes/index'
import authConfig from '#configs/auth'
import openApiMiddleware from '#middlewares/openapi'
import config from '#configs/environment'
import rateLimit from 'express-rate-limit'

const app = express()

// Configure CORS
const corsOptions = {
    origin: [config.corsOrigin.domain, 'http://localhost:3030'],
    credentials: true,
    optionsSuccessStatus: 204,
}
app.use(cors(corsOptions))

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.',
    handler: (req, res, next, options) => {
        res.setHeader('Retry-After', Math.ceil(options.windowMs / 1000)); // Thêm header
        res.status(options.statusCode).json({
            error: "Quá nhiều yêu cầu",
            retryAfter: `${Math.ceil(options.windowMs / 1000)} giây`,
        });
    },
})
app.use(limiter)

app.use(bodyParser.json())
app.use(helmet())
// @ts-ignore
app.use(pino({ logger }))
app.use(cookieParser())
app.use(authConfig)

app.use('/docs', ...openApiMiddleware)
app.use('/api', routes)

export default app
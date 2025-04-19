import 'express-async-errors';
import cors from 'cors';
import express from 'express';
import pino from 'express-pino-logger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import logger from '#configs/logger';
import routes from '#routes/index';
import authConfig from '#configs/auth';
import openApiMiddleware from '#middlewares/openapi';
import config from '#configs/environment';
import rateLimit from 'express-rate-limit';
import * as database from '#configs/database';
import * as email from '#configs/email';

// Khởi tạo Express app
const app = express();

// Kết nối cơ sở dữ liệu và các khởi tạo khác (tương tự main.js)
const initialize = async () => {
    try {
        // Kết nối cơ sở dữ liệu
        await database.connect(config.mongo.uri);
        logger.info('database connected');

        // Xác minh kết nối email
        await email.verifyConnection();
        logger.info('email connection verified');
    } catch (err) {
        logger.error({ err, msg: 'Failed to initialize server' });
        throw err;
    }
};

// Gọi hàm khởi tạo
initialize().catch(err => {
    logger.fatal({ err, msg: 'Initialization failed' });
});

// Configure CORS
const corsOptions = {
    origin: [config.corsOrigin.domain, 'http://localhost:3030', '*'],
    credentials: true,
    optionsSuccessStatus: 204,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
};
app.use(cors(corsOptions));
app.set('trust proxy', 1);

const limiter = rateLimit({
    windowMs: 2 * 60 * 1000,
    max: 100,
    message: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.',
    handler: (req, res, next, options) => {
        res.setHeader('Retry-After', Math.ceil(options.windowMs / 1000));
        res.status(options.statusCode).json({
            error: "Quá nhiều yêu cầu",
            retryAfter: `${Math.ceil(options.windowMs / 1000)} giây`,
        });
    },
});
app.use(limiter);

app.use(helmet());
app.use(pino({ logger }));
app.use(cookieParser());
app.use(authConfig);
app.use(express.json());

// Route mặc định
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Welcome to Dino Management API' });
});

// Route kiểm tra trạng thái
app.get('/health', async (req, res) => {
    try {
        await database.ping();
        res.status(200).json({ status: 'OK', database: 'Connected' });
    } catch (err) {
        logger.error({ err, msg: 'Health check failed' });
        res.status(500).json({ status: 'Error', database: 'Disconnected' });
    }
});

app.use('/api', routes);

export default app;
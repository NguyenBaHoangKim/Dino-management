import path from 'path'
import { bool, cleanEnv, num, str } from 'envalid'
import { LogFormat, LogLevel } from '#enums/log'

const appPath = path.dirname(import.meta.url).replace('file:///', '')
console.log(path.join(appPath, '../../openapi.yaml'))
const env = cleanEnv(process.env, {
    NODE_ENV: str({
        choices: ['development', 'test', 'production', 'staging'],
        default: 'development',
    }),
    PORT: num({ default: 3000 }),
    JWT_SECRET: str(),
    JWT_ACCESS_EXPIRATION_MINUTES: num({ default: 60 }), //60
    JWT_REFRESH_EXPIRATION_MINUTES: num({ default: 7 * 24 * 60 * 60 * 1000 }),
    MONGO_URI: str(),
    EMAIL_HOST: str(),
    EMAIL_PORT: num({ default: 25 }),
    EMAIL_USERNAME: str(),
    EMAIL_PASSWORD: str(),
    LOG_FORMAT: str({
        choices: Object.values(LogFormat),
        default: LogFormat.JSON,
    }),
    LOG_LEVEL: str({
        choices: Object.values(LogLevel).map(l => l.str),
        default: LogLevel.INFO.str,
    }),
    LOG_DATABASE_QUERIES: bool({
        default: false,
    }),
    OTEL_ENABLED: bool({
        default: false,
    }),
    OTEL_SERVICE_NAME: str(),
    OTEL_EXPORTER_JAEGER_ENDPOINT: str(),
    GITHUB_REPO: str(),
    GITHUB_OWNER: str(),
    GITHUB_TOKEN: str(),
    GITHUB_BASEURL: str(),
    GOOGLE_CLIENT_ID: str(),
    GOOGLE_CLIENT_SECRET: str(),
    GOOGLE_REDIRECT_URI: str(),
    CORS_ORIGINS: str()
})

export default Object.freeze({
    appPath,
    openApiPath: path.join(appPath, '../../openapi.yaml'),
    version: '1.0.0',
    env: env.NODE_ENV,
    isProduction: env.NODE_ENV === 'production',
    port: env.PORT,
    github: {
        repo: env.GITHUB_REPO,
        owner: env.GITHUB_OWNER,
        token: env.GITHUB_TOKEN,
        baseUrl: env.GITHUB_BASEURL
    },
    google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        redirectUri: env.GOOGLE_REDIRECT_URI
    },
    corsOrigin: {
        domain: env.CORS_ORIGINS
    },
    auth: {
        jwtSecret: env.JWT_SECRET,
        jwtAccessExpiration: env.JWT_ACCESS_EXPIRATION_MINUTES,
        jwtRefreshExpiration: env.JWT_REFRESH_EXPIRATION_MINUTES
    },
    log: {
        format: env.LOG_FORMAT,
        level: env.LOG_LEVEL,
        databaseQueries: env.LOG_DATABASE_QUERIES,
    },
    otel: {
        isEnabled: env.OTEL_ENABLED,
    },
    mongo: {
        uri: env.MONGO_URI,
    },
    email: {
        host: env.EMAIL_HOST,
        port: env.EMAIL_PORT,
        username: env.EMAIL_USERNAME,
        password: env.EMAIL_PASSWORD,
    },
})
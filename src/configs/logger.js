import { context, isSpanContextValid, trace } from '@opentelemetry/api'
import { pino } from 'pino'
import path from 'path'
import { fileURLToPath } from 'url'
import config from '#configs/environment'
import { LogFormat } from '#enums/log'

// Get the current file path and directory name
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function otelMixin() {
    if (!config.otel.isEnabled) {
        return {}
    }

    const span = trace.getSpan(context.active())
    if (!span) {
        return {}
    }

    const spanContext = span.spanContext()
    if (!isSpanContextValid(spanContext)) {
        return {}
    }

    return {
        trace_id: spanContext.traceId,
        span_id: spanContext.spanId,
        trace_flags: `0${spanContext.traceFlags.toString(16)}`,
    }
}

const logger = pino({
    timestamp: true,
    level: config.log.level,
    base: {
        appVersion: config.version,
    },
    mixin: otelMixin,
    redact: ['config.auth.jwtSecret', 'config.mongo.uri', 'config.email.password'],
    transport:
        config.log.format === LogFormat.JSON
            ? undefined
            : {
                target: path.resolve(__dirname, './logger-pretty.js'),
                options: {
                    ignore: 'appVersion',
                    translateTime: 'SYS:HH:MM:ss.l',
                },
            },
})

export default logger
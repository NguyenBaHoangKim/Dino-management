import assert from 'node:assert'
import mongoose from 'mongoose'
import config from '#configs/environment'
import logger from '#configs/logger'

const formatArg = mongoose.Collection.prototype.$format

if (config.log.databaseQueries) {
    mongoose.set('debug', queryLogger)
}

export async function connect(uri) {
    await mongoose.connect(uri)
    mongoose.connection.on('error', err => {
        logger.error({ err }, 'mongodb connection error')
        process.exit(1)
    })
    mongoose.connection.on('connected', () => {
        logger.info('mongodb connected')
    })
    return mongoose.connection
}

export async function disconnect() {
    await mongoose.disconnect()
}

export async function ping() {
    const result = await mongoose.connection.db.admin().ping()
    assert(result?.ok === 1)
}

function queryLogger(collectionName, methodName, ...methodArgs) {
    const functionCall = [collectionName, methodName].join('.')

    const args = []
    for (let arg = methodArgs.length - 1; arg >= 0; --arg) {
        if (formatArg(methodArgs[arg]) || args.length > 0) {
            args.unshift(formatArg(methodArgs[arg]))
        }
    }

    const query = `${functionCall}(${args.join(', ')})`
    logger.debug({ query }, 'executing mongodb query')
}
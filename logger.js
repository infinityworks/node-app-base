'use strict'

const debug = require('debug')

let appName
function setName(value) {
    appName = value
}

function makeLogger(level, sendStdErr) {
    var logger = debug('app.' + level)

    if (sendStdErr) {
        logger.log = console.error.bind(console)
    }

    return function(logKey, data) {
        if (!/^[a-zA-Z0-9.-]+$/.test(logKey)) {
            loggers.warn('logger.invalid.key', {
                key: logKey,
                message: 'Log key must be alphanumeric plus dots and dashes, else log forwarding will fail'
            })
        }

        const logLine = '[' + appName + '] ' + logKey + ': %o'
        logger(logLine, data || {})
    }
}

let loggers = {
    error: makeLogger('error', true),
    warn:  makeLogger('warn', true),
    info:  makeLogger('info')
}

module.exports = {
    setName: setName,
    loggers: loggers
}

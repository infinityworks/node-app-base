'use strict'

function makeLogger(level, sendStdErr) {
    const logger = {
        log: process.stdout.write.bind(process.stdout)
    }
    if (sendStdErr) {
        logger.log = process.stderr.write.bind(process.stderr)
    }

    return function(logKey, data) {
        if (!/^[a-zA-Z0-9.-]+$/.test(logKey)) {
            loggers.warn('logger.invalid.key', {
                key: logKey,
                message: 'Log key must be alphanumeric plus dots and dashes, else log forwarding will fail'
            })
        }

        const timestamp = getTimestamp()

        let metaFields = {
            logtime: timestamp.millisSinceEpoch,
            time:    timestamp.humanTime,
            level:   level,
            event:   logKey
        }

        for (const key in data) {
            if (!metaFields[key]) {
                metaFields[key] = data[key]
            }
        }

        logger.log(JSON.stringify(metaFields) + '\n')
    }
}

function getTimestamp() {
    const date = new Date;
    const millisSinceEpoch = Date.now()

    const humanTime = [
        date.getFullYear(),
        date.getMonth()+1,
        date.getDate()
    ].join('-') + ' ' + [
        date.getHours(),
        date.getMinutes(),
        date.getSeconds()
    ].join(':');

    return {
        millisSinceEpoch: millisSinceEpoch,
        humanTime: humanTime
    }
}


let loggers = {
    error: makeLogger('error', true),
    warn:  makeLogger('warn', true),
    info:  makeLogger('info')
}

module.exports = {
    loggers: loggers
}

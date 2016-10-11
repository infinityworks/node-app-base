'use strict'

let startTime = new Date

const Logger = require('./logger')
const Config = require('./config')
const Metrics = require('./metrics')

function setName(value) {
    Logger.setName(value)
    Metrics.setName(value)
}
setName('myapp')

Metrics.setStartTime(startTime)

module.exports = {
    setName: setName,
    logger: Logger.loggers,
    config: Config,
    metrics: Metrics.metrics
}


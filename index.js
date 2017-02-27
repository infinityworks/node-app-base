'use strict'

const Logger = require('./logger')
const Config = require('./config')
const Metrics = require('./metrics')

function setName(value) {
    Metrics.setName(value)
}
setName('myapp')

module.exports = {
    setName: setName,
    logger: Logger.loggers,
    config: Config,
    metrics: Metrics.metrics
}


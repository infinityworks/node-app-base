'use strict'

const Logger = require('./logger')
const Config = require('./config')
const Metrics = require('./metrics')

const logger = Logger()
const config = Config()
const metrics = Metrics()

function setName(value) {
    metrics.setName(value)
}
setName('myapp')

module.exports = {
    setName: setName,
    logger: logger,
    config: config,
    metrics: metrics.metrics
}


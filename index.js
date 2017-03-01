'use strict'

const Logger = require('./logger')
const Config = require('./config')
const Metrics = require('./metrics')

const instances = {}

module.exports = (appName) => {
  if (!instances[appName]) {
    instances[appName] = getInstance(appName)
  }
  return instances[appName]
}

function getInstance(appName) {
  const metrics = Metrics(appName)
  const logger = Logger(metrics)
  const config = Config()

  return {
    logger: logger,
    config: config,
    metrics: metrics
  }
}

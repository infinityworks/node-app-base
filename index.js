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
  const logger = Logger()
  const config = Config()
  const metrics = Metrics(appName)

  return {
    logger: logger,
    config: config,
    metrics: metrics
  }
}

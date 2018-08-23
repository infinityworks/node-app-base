'use strict'

const Logger = require('./modules/logger')
const Config = require('./modules/config')
const Metrics = require('./modules/metrics')
const Timers = require('./modules/timers')
const Slack = require('./modules/slack')
const HealthCheck = require('./modules/healthCheck')

const instances = {}

module.exports = (appName) => {
  appName = getSafeAppName(appName)

  if (!instances[appName]) {
    instances[appName] = getInstance(appName)
  }
  return instances[appName]
}

function getInstance(appName) {
  const metrics = Metrics(appName)
  const logger = Logger(metrics)
  const config = Config()
  const timers = Timers()
  const slack = Slack(appName, config)
  const healthCheck = HealthCheck(logger, config)

  return {
    logger,
    config,
    metrics,
    timers,
    slack,
    healthCheck
  }
}

function getSafeAppName(appName) {
  return appName
    .replace(/-/g,'_')
    .replace(/[^a-z0-9_]/gi, '')
}

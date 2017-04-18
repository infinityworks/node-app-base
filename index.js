'use strict'

const Logger = require('./logger')
const Config = require('./config')
const Metrics = require('./metrics')
const Timers = require('./timers')
const Slack = require('./slack')

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
  const timers = Timers()
  const slack = Slack(appName, config)

  return {
    logger: logger,
    config: config,
    metrics: metrics,
    timers: timers,
    slack: slack
  }
}

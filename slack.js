'use strict'

const Slack = require('node-slack')

module.exports = (appName, config) => {
  return {
      postMessage: postMessage
  }

  function postMessage(text, callback) {
    const enabled = config.get('SLACK_ENABLED')

    if (!enabled) {
      return callback()
    }

    const url = config.get('SLACK_URL')
    const channel = config.get('SLACK_CHANNEL')

    const configErr = noConfigCheck(url, channel)
    if (configErr) {
      return callback(configErr)
    }

    const slack = new Slack(url)

    return slack.send(
      {
        username: appName,
        channel: channel,
        text: text
      },
      callback
    )
  }

  function noConfigCheck(url, channel) {
    if (!url) {
      return new Error('No url specified, please set SLACK_TOKEN environment variable')
    }

    if (!channel) {
      return new Error('No channel specified, please set SLACK_CHANNEL environment variable')
    }

    return false
  }
}

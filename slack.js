'use strict'

const Slack = require('node-slack')

module.exports = (appName, config) => {
  const url = config.get('SLACK_URL')
  const channel = config.get('SLACK_CHANNEL')

  return {
      postMessage: postMessage
  }

  function postMessage(text, callback) {
    if (noConfigCheck(callback)) {
      return
    }

    const slack = new Slack(url)
    return slack.send({
      text: text,
      channel: channel,
      username: appName
    })
  }

  function noConfigCheck(callback) {
    if (!url) {
      callback(
        new Error('No url specified, please set SLACK_TOKEN environment variable')
      )
      return true
    }

    if (!channel) {
      callback(
        new Error('No channel specified, please set SLACK_CHANNEL environment variable')
      )
      return true
    }

    return false
  }
}

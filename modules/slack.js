'use strict'

const Slack = require('node-slack')

module.exports = (appName, config) => {
  return {
    postMessage: postMessage
  }

  function postMessage(text, callback) {
    callback = callback || function() {}

    const username = config.get('SLACK_USERNAME')
    const url = config.get('SLACK_URL')
    const channel = config.get('SLACK_CHANNEL')
    const emoji = config.get('SLACK_EMOJI')

    const configErr = noConfigCheck(url)
    if (configErr) {
      return callback(configErr)
    }

    const slackConfig = {
      text: text
    }

    if (username) {
        slackConfig.username = username
    }

    if (channel) {
      slackConfig.channel = channel
    }

    if (emoji) {
      slackConfig.icon_emoji = emoji
    }

    const slack = new Slack(url)
    return slack.send(slackConfig, callback)
  }

  function noConfigCheck(url) {
    if (!url) {
      return new Error('No url specified, please set SLACK_URL environment variable')
    }

    return false
  }
}

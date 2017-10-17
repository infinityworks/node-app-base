'use strict'
const base = require('../index')('example')

base.config.set({
    // Port to listen on
    HTTP_PORT: { type: 'int', default: 1337 },
    // Name of person to greet
    GREETING_NAME: { type: 'string', default: 'world' },
    SLACK_ENABLED: { type: 'bool', default: false },
    SLACK_URL: { type: 'string', default: 'insert_slack_webhook_here' },
    SLACK_CHANNEL: { type: 'string', default: '#testchannel' }
})

const app = require('./app')
app.start()

setInterval(() => {
  base.logger.info('heartbeat')
}, 1032)

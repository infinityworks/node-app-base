'use strict'
const base = require('../index')

base.setName('example')

base.config.set({
    // Port to listen on
    HTTP_PORT: { type: 'int', default: 3000 },
    // Name of person to greet
    GREETING_NAME: { type: 'string', default: 'world' }
})

const app = require('./app')
app.start()

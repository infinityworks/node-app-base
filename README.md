node-app-base
---

[![Build Status](https://travis-ci.org/infinityworks/node-app-base.svg?branch=master)](https://travis-ci.org/infinityworks/node-app-base)
[![NPM version](https://badge.fury.io/js/node-app-base.svg)](http://badge.fury.io/js/node-app-base)

Basic utilities for running node microservices

See: https://github.com/infinityworks/docker-node-base

## How to use

Require the base library and call it as a function, passing in your application name. The application name will be used to configure the various internal modules of the base, and must be alphanumeric with underscores only.

When instantiated, the base returns an object holding its modules, and it is recommended that you dereference these for use:

```js
const base = require('node-app-base')('example')
const { config, logger, metrics, timers, slack } = base
```

The base library is a singleton, so you can either pass it around through your application or simply call it again passing in the same application name.

See included example application for further details.

## API examples

### config

Provides access to safely read environment variables.

```js
config.set({
    foo: {
        type: 'integer',
        default: 5
    },
    bar: {
        type: 'string',
        required: true
    }
})

// if foo is not overridden by an environment variable
config.get('foo') // returns 5

// if bar is a defined environment variable
config.get('bar') // returns bar, cast to a string

// if bar is not a defined an environment variable
config.get('bar') // throws error

```

Available values for the `type` parameter:
- `string`
- `int`, `integer`, `number`
- `float`
- `bool`, `boolean`

### logger

Provides basic logging functions. The first argument should always be an alphanumeric key (dots and dashes are also allowed), and the optional second argument is a JSON object that is intended to provide context to the log line.

Note that there is intentionally no debug function, as we do not want to encourage divergence between the development and production environment.

```js
logger.info('request.start', { path: url })

logger.warn('db.username.update.fail', { userId: id, time: timeNow })

logger.error('fatal', { message: err.toString() })
```

### metrics

Provides an Prometheys-style instrumentation interface listening on port 9091 as standard. The module can be used to add additional metrics to the interface.

The operations below are all upserts, so they will create the metric for the first time if it does not already exist. This means that new metrics may appear in the instrumentation interface when new code paths have been hit.

See the npm prom-client module for further details.

```js
metrics.counter({
    name: 'request_count',
    help: 'Total incoming HTTP requests',
    labels: {
        statusCode: statusCode
    }
})

metrics.gauge({
    name: 'random_value',
    help: 'Some random value set on each request',
    value: Math.floor(Math.random() * 1000)
})

metrics.histogram({
    name: 'response_time_milliseconds',
    help: 'Response time duration distribution',
    buckets: [ 10, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000 ],
    value: responseTimeMs,
    labels: {
        uri: uri
    }
})

metrics.summary({
    name: 'response_time_percentile',
    help: 'Response time percentile distribution',
    percentiles: [ 0.01, 0.1, 0.9, 0.99 ],
    value: responseTimeMs
})
```

### timers

Provides high-resolution timers. Useful to use with logging.

```js
const startToken = timers.start()

// do work

const duration = timers.stop(startToken)

console.log(duration) // an integer of the milliseconds elapsed since start was called.
```

### slack

Allows the application to send messages to Slack.

This module relies on the following environment variables having been configured:

```
SLACK_URL: required, the webhook URL for slack
SLACK_CHANNEL: required: the channel or user at which to send messages
SLACK_USERNAME: optional, the username messages appear to have come from. Uses to the base app-name is not defined
SLACK_EMOJI: optional: the emoji icon for the slack user.
```

```js
// if the required environment variables are defined
slack.postMessage('hello slack', (err) => {
    // err is undefined
})

// if the required environment variables are not defined
slack.postMessage('hello slack', (err) => {
    console.log(err.toString())
    // err is an Error object containing a message as to what was not defined.
})
```

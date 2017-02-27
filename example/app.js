'use strict'
const base = require('../index')

const http = require('http');
const crypto = require('crypto')
const hostname = '127.0.0.1';
const port = base.config.get('HTTP_PORT');

const server = http.createServer((req, res) => {
    let startTime = new Date

    base.logger.info('request.start', { path: req.url })

    let statusCode = 200
    let message = ''

    if (req.url == '/') {
        let greeting = base.config.get('GREETING_NAME')
        message = 'Hello ' + greeting + '\n'

        // Do some work, for the sake of the example app
        let difficulty = Math.floor(Math.random() * 5)
        doWork(difficulty)

    } else if (req.url == '/error') {
        base.logger.error('request.url.error')
        statusCode = 500;
        message = 'oh no\n'

    } else {
        base.logger.warn('request.url.warn')
        statusCode = 404;
        message = 'cannot find it\n'
    }

    res.setHeader('Content-Type', 'text/plain');
    res.end(message);

    let responseTime = new Date - startTime

    base.logger.info('request.end', { path: req.url, time: responseTime })

    base.metrics.counter({
        name: 'request_count',
        help: 'Total incoming HTTP requests',
        labels: {
            statusCode: statusCode
        }
    })

    base.metrics.gauge({
        name: 'random_value',
        help: 'Some random value set on each request',
        value: Math.floor(Math.random() * 1000)
    })

    base.metrics.histogram({
        name: 'response_time_milliseconds',
        help: 'Response time distribution',
        buckets: [ 10, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000 ],
        value: responseTime
    })
});

exports.start = function() {
    server.listen(port, hostname, () => {
          base.logger.info('server.startup', { hostname: hostname, port: port});
    });
}

function doWork(difficulty) {
    for (let i = 0; i < difficulty * 100000; i++) {
        let hash = crypto.createHash('sha256')
        hash.update(i + '')
        hash.digest('hex')
    }
}

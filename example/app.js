const http = require('http');
const crypto = require('crypto');
const base = require('../index')('example');

const hostname = '127.0.0.1';
const port = base.config.get('HTTP_PORT');

function doWork(difficulty) {
    for (let i = 0; i < difficulty * 100000; i += 1) {
        const hash = crypto.createHash('sha256');
        hash.update(`${i}`);
        hash.digest('hex');
    }
}

const server = http.createServer((req, res) => {
    base.timers.start('app');

    base.logger.info('request.start', { path: req.url });

    let statusCode = 200;
    let message = '';

    if (req.url === '/') {
        const greeting = base.config.get('GREETING_NAME');
        message = `Hello ${greeting}\n`;

        // Do some work, for the sake of the example app
        const difficulty = Math.floor(Math.random() * 5);
        doWork(difficulty);
    } else if (req.url === '/error') {
        base.logger.error('request.url.error');
        statusCode = 500;
        message = 'oh no\n';
    } else {
        base.logger.warn('request.url.warn');
        statusCode = 404;
        message = 'cannot find it\n';
    }

    res.setHeader('Content-Type', 'text/plain');
    res.end(message);

    const responseTimeMs = base.timers.stop('app');

    base.logger.info('request.end', { path: req.url, time: responseTimeMs });

    base.metrics.counter({
        name: 'request_count',
        help: 'Total incoming HTTP requests',
        labels: {
            statusCode,
        },
    });

    base.metrics.gauge({
        name: 'random_value',
        help: 'Some random value set on each request',
        value: Math.floor(Math.random() * 1000),
    });

    base.metrics.histogram({
        name: 'response_time_milliseconds',
        help: 'Response time duration distribution',
        buckets: [10, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
        value: responseTimeMs,
    });

    base.metrics.summary({
        name: 'response_time_percentile',
        help: 'Response time percentile distribution',
        percentiles: [0.01, 0.1, 0.9, 0.99],
        value: responseTimeMs,
    });
});

exports.start = function start() {
    server.listen(port, hostname, () => {
        base.logger.info('server.startup', { hostname, port });
        base.slack.postMessage('Server started', () => { });
    });
};

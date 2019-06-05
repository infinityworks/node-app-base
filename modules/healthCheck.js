const http = require('http');

module.exports = (
    logger,
    config,
) => {
    function initListener(promiseCallback) {
        const httpPort = config.get('HEALTHCHECK_HTTP_LISTEN_PORT') || 8999;

        const callback = promiseCallback || (() => Promise.resolve(true));

        const server = http.createServer((req, res) => {
            callback()
                .then(() => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'text/plain');
                    res.end('Ok\n');
                })
                .catch(() => {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'text/plain');
                    res.end('Unhealthy\n');
                });
        });

        server.listen(httpPort, () => {
            logger.info('base.healthcheck.listen', { port: httpPort });
        });
    }

    return {
        initListener,
    };
};

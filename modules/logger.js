module.exports = (metrics) => {
    function padStart(value, targetLength, padString) {
        const stdValue = `${value}`;
        if (stdValue.length > targetLength) {
            return stdValue;
        }

        const remainingLength = targetLength - stdValue.length;
        let fullPadString = padString;
        if (remainingLength > padString.length) {
            // append to original to ensure we are longer than needed
            fullPadString += padString.repeat(remainingLength / padString.length);
        }
        return fullPadString.slice(0, remainingLength) + stdValue;
    }

    function getTimestamp() {
        const date = new Date();
        const millisSinceEpoch = Date.now();

        const humanTime = `${[
            date.getUTCFullYear(),
            padStart(date.getUTCMonth() + 1, 2, '0'),
            padStart(date.getUTCDate(), 2, '0'),
        ].join('-')} ${[
            padStart(date.getUTCHours(), 2, '0'),
            padStart(date.getUTCMinutes(), 2, '0'),
            padStart(date.getUTCSeconds(), 2, '0'),
        ].join(':')}.${
            padStart(date.getUTCMilliseconds(), 3, '0')}`;


        return {
            millisSinceEpoch,
            humanTime,
        };
    }

    function makeLogger(level, sendStdErr) {
        const logger = {
            log: process.stdout.write.bind(process.stdout),
        };
        if (sendStdErr) {
            logger.log = process.stderr.write.bind(process.stderr);
        }

        return function levelLogger(logKey, data) {
            if (!/^[a-zA-Z0-9.-]+$/.test(logKey)) {
                logger.log('logger.invalid.key', {
                    key: logKey,
                    message: 'Log key must be alphanumeric plus dots and dashes, else log forwarding will fail',
                });
            }

            const timestamp = getTimestamp();

            const metaFields = {
                ...data,
                time: timestamp.humanTime,
                level,
                event: logKey,
            };

            metrics.counter({
                name: 'log_line',
                help: 'Count of application log lines by level',
                labels: {
                    level,
                },
            });

            logger.log(`${JSON.stringify(metaFields)}\n`);
        };
    }

    return {
        error: makeLogger('error'),
        warn: makeLogger('warn'),
        info: makeLogger('info'),
    };
};

module.exports = (logger, timers) => {
    async function asyncLogsAndTimer(label, operation, getMetaInfo) {
        logger.info(`${label}.start`);
        const timerToken = timers.start();
        try {
            const result = await operation();
            const duration = timers.stop(timerToken);

            let meta;

            if (typeof getMetaInfo === 'function') {
                meta = getMetaInfo(result);
            } else if (typeof getMetaInfo === 'undefined') {
                meta = {};
            } else {
                meta = getMetaInfo;
            }
            meta.duration = duration;

            logger.info(`${label}.complete`, meta);
            return result;
        } catch (err) {
            timers.stop(timerToken);
            logger.error(`${label}.failed`, err);
            throw err;
        }
    }

    function logsAndTimer(label, operation, getMetaInfo) {
        logger.info(`${label}.start`);
        const timerToken = timers.start();
        try {
            const result = operation();
            const duration = timers.stop(timerToken);

            let meta;

            if (typeof getMetaInfo === 'function') {
                meta = getMetaInfo(result);
            } else if (typeof getMetaInfo === 'undefined') {
                meta = {};
            } else {
                meta = getMetaInfo;
            }
            meta.duration = duration;

            logger.info(`${label}.complete`, meta);
            return result;
        } catch (err) {
            timers.stop(timerToken);
            logger.error(`${label}.failed`, err);
            throw err;
        }
    }

    return {
        asyncLogsAndTimer,
        logsAndTimer,
    };
};

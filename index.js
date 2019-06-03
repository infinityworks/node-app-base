const Logger = require('./modules/logger');
const Config = require('./modules/config');
const Metrics = require('./modules/metrics');
const Timers = require('./modules/timers');
const Slack = require('./modules/slack');
const HealthCheck = require('./modules/healthCheck');
const Wrappers = require('./modules/wrappers');

const instances = {};

function getInstance(appName) {
    const metrics = Metrics(appName);
    const logger = Logger(metrics);
    const config = Config();
    const timers = Timers();
    const slack = Slack(appName, config);
    const healthCheck = HealthCheck(logger, config);
    const wrappers = Wrappers(logger, timers);

    return {
        logger,
        config,
        metrics,
        timers,
        slack,
        healthCheck,
        wrappers,
    };
}

function getSafeAppName(appName) {
    return appName
        .replace(/-/g, '_')
        .replace(/[^a-z0-9_]/gi, '');
}

module.exports = (appName) => {
    const safeAppName = getSafeAppName(appName);

    if (!instances[safeAppName]) {
        instances[safeAppName] = getInstance(safeAppName);
    }
    return instances[safeAppName];
};

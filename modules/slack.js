const Slack = require('node-slack');

module.exports = (appName, config) => {
    function noConfigCheck(url) {
        if (!url) {
            return new Error('No url specified, please set SLACK_URL environment variable');
        }

        return false;
    }

    function postMessage(text, callback, critical) {
        const cb = callback || function noop() {};

        const username = config.get('SLACK_USERNAME');
        const url = config.get('SLACK_URL');
        const emoji = config.get('SLACK_EMOJI');

        let channel = config.get('SLACK_CHANNEL');
        if (critical) {
            channel = config.get('CRITICAL_SLACK_CHANNEL');
        }

        const configErr = noConfigCheck(url);
        if (configErr) {
            return cb(configErr);
        }

        const slackConfig = {
            text,
        };

        if (username) {
            slackConfig.username = username;
        }

        if (channel) {
            slackConfig.channel = channel;
        }

        if (emoji) {
            slackConfig.icon_emoji = emoji;
        }

        const slack = new Slack(url);
        return slack.send(slackConfig, cb);
    }

    return {
        postMessage,
    };
};

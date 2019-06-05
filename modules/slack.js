const Slack = require('node-slack');

module.exports = (appName, config) => {
    function noConfigCheck(url) {
        if (!url) {
            return new Error('No url specified, please set SLACK_URL environment variable');
        }

        return false;
    }

    function postMessage(text, callback) {
        const cb = callback || function noop() {};

        const username = config.get('SLACK_USERNAME');
        const url = config.get('SLACK_URL');
        const channel = config.get('SLACK_CHANNEL');
        const emoji = config.get('SLACK_EMOJI');

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

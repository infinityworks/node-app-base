'use strict'

module.exports = (metrics) => {

  function makeLogger(level, sendStdErr) {
    const logger = {
      log: process.stdout.write.bind(process.stdout)
    }
    if (sendStdErr) {
      logger.log = process.stderr.write.bind(process.stderr)
    }

    return function(logKey, data) {
      if (!/^[a-zA-Z0-9.-]+$/.test(logKey)) {
        logger.warn('logger.invalid.key', {
          key: logKey,
          message: 'Log key must be alphanumeric plus dots and dashes, else log forwarding will fail'
        })
      }

      const timestamp = getTimestamp()

      let metaFields = {
        logtime: timestamp.millisSinceEpoch,
        time:    timestamp.humanTime,
        level:   level,
        event:   logKey
      }

      for (const key in data) {
        if (!metaFields[key]) {
          metaFields[key] = data[key]
        }
      }

      metrics.counter({
        name: 'log_line',
        help: 'Count of application log lines by level',
        labels: {
          level: level
        }
      })

      logger.log(JSON.stringify(metaFields) + '\n')
    }
  }

  function getTimestamp() {
    const date = new Date;
    const millisSinceEpoch = Date.now()

    const humanTime = [
      date.getFullYear(),
      padToTwo(date.getMonth()+1),
      padToTwo(date.getDate())
    ].join('-') + ' ' + [
      padToTwo(date.getHours()),
      padToTwo(date.getMinutes()),
      padToTwo(date.getSeconds())
    ].join(':');

    return {
      millisSinceEpoch: millisSinceEpoch,
      humanTime: humanTime
    }
  }

  function padToTwo(number) {
    if (number <= 9) {
      number = ("0"+number).slice(-2);
    }
    return number;
  }

  return {
    error: makeLogger('error'),
    warn:  makeLogger('warn'),
    info:  makeLogger('info')
  }
}



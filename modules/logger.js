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
        logger.log('logger.invalid.key', {
          key: logKey,
          message: 'Log key must be alphanumeric plus dots and dashes, else log forwarding will fail'
        })
      }

      const timestamp = getTimestamp()

      let metaFields = {
        time:    timestamp.humanTime,
        level:   level,
        event:   logKey
      }

      for (const key in data) {
        if (!metaFields[key]) {
          metaFields[key] = data[key]
        }
      }

      if (metrics) {
        metrics.counter({
          name: 'log_line',
          help: 'Count of application log lines by level',
          labels: {
            level: level
          }
        })
      }

      logger.log(JSON.stringify(metaFields) + '\n')
    }
  }

  function getTimestamp() {
    const date = new Date;
    const millisSinceEpoch = Date.now()

    const humanTime = [
      date.getUTCFullYear(),
      padStart(date.getUTCMonth()+1, 2, '0'),
      padStart(date.getUTCDate(), 2, '0')
    ].join('-') + ' ' + [
      padStart(date.getUTCHours(), 2, '0'),
      padStart(date.getUTCMinutes(), 2, '0'),
      padStart(date.getUTCSeconds(), 2, '0')
    ].join(':') + '.' +
      padStart(date.getUTCMilliseconds(), 3, '0')


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

  function padStart(value, targetLength, padString) {
      value = value + ''
      targetLength = targetLength>>0; //floor if number or convert non-number to 0;
      padString = String(padString || ' ');
      if (value.length > targetLength) {
          return String(value);
      }

      targetLength = targetLength-value.length;
      if (targetLength > padString.length) {
          padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
      }
      return padString.slice(0,targetLength) + String(value);
  }

  return {
    error: makeLogger('error'),
    warn:  makeLogger('warn'),
    info:  makeLogger('info')
  }
}

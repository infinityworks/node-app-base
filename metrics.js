'use strict'

const http = require('http')
const client = require('prom-client')

let appName
let startTime

module.exports = {
    setName: setName,
    setStartTime: setStartTime,
    metrics: {
        counter: counter,
        gauge: gauge,
        histogram: histogram
    }
}

http.createServer((req, res) => {
  if (req.url !== '/metrics') {
    res.statusCode = 404
    res.end('404')
    return
  }

  res.end(client.register.metrics())
}).listen(9091)

function setName(value) {
    appName = value
}

function setStartTime(value) {
    startTime = value
}

function counter(data) {
    return upsertMetric('counter', data)
}

function gauge(data) {
    return upsertMetric('gauge', data)
}

function histogram(data) {
    return upsertMetric('histogram', data)
}

function upsertMetric(type, data) {
    const name = appName + '_' + data.name
    const help = data.help
    const labels = data.labels || {}
    const labelKeys = Object.keys(labels)

    let metric = client.register.getSingleMetric(name)
    if (!metric) {
        if (type == 'counter') {
            metric = new client.Counter(name, help, labelKeys)
        } else if (type === 'gauge') {
            metric = new client.Gauge(name, help, labelKeys)
        } else if (type === 'histogram') {
            metric = new client.Histogram(name, help, {
              buckets: data.buckets
            })
        }
    }

    const value = Number.isInteger(data.value) ? data.value : null

    if (type == 'counter') {
        metric.inc(labels)
    } else if (type === 'gauge' && value !== null) {
        metric.set(labels, value)
    } else if (type === 'histogram' && value !== null) {
        metric.observe(value)
    }
}

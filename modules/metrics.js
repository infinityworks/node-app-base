'use strict'

const http = require('http')
const client = require('prom-client')

module.exports = (appName) => {

  function counter(data) {
    return upsertMetric('counter', data)
  }

  function gauge(data) {
    return upsertMetric('gauge', data)
  }

  function histogram(data) {
    return upsertMetric('histogram', data)
  }

  function summary(data) {
    return upsertMetric('summary', data)
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
      } else if (type === 'summary') {
        metric = new client.Summary(name, help, {
          percentiles: data.percentiles
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
    } else if (type === 'summary' && value !== null) {
      metric.observe(value)
    }
  }

  function createHttpServer() {
    http.createServer((req, res) => {
      if (req.url !== '/metrics') {
        res.statusCode = 404
        res.end('404')
        return
      }

      res.end(client.register.metrics())
    }).listen(9091)
  }

  createHttpServer()

  return {
    counter: counter,
    gauge: gauge,
    histogram: histogram,
    summary: summary,
    linearBuckets: client.linearBuckets.bind(client),
    exponentialBuckets: client.exponentialBuckets.bind(client)
  }
}



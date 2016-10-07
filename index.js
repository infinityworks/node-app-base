'use strict'

let startTime = new Date
let appName

exports.setName = function(value) {
    appName = value
}

const v8 = require('v8')
const prometheus = require('prometheus-client-js')
const debug = require('debug')

class Metrics {

    constructor() {
        this.metrics = {}
        this.client
    }

    startServer(port) {
        this.client = new prometheus({ port: port })
        this.client.createServer(true)
    }

    counter(data) {
        return this.upsertMetric('counter', data)
    }

    gauge(data) {
        return this.upsertMetric('gauge', data)
    }

    histogram(data) {
        return this.upsertMetric('histogram', data)
    }

    upsertMetric(type, data) {
        if (!this.metrics[data.name]) {
            let metric
            if (type == 'counter') {
                metric = this.client.createCounter(data)
            } else if (type === 'gauge') {
                metric = this.client.createGauge(data)
            } else if (type === 'histogram') {
                metric = this.client.createHistogram(data)
            }
            this.metrics[data.name] = metric
        }

        let labels = data.labels || {}
        let value = data.value || null

        if (type == 'counter') {
            this.metrics[data.name].increment(labels)
        } else if (type === 'gauge') {
            this.metrics[data.name].set(labels, value)
        } else if (type === 'histogram') {
            this.metrics[data.name].observe(value)
        }
    }

}

const BaseMetrics = new Metrics()

function updateMetrics() {
    const value = Math.floor((new Date - startTime) / 1000)

    BaseMetrics.gauge({
        name: 'uptime_seconds',
        namespace: appName,
        help: 'Lifetime of application in seconds',
        value: value
    })

    BaseMetrics.gauge({
        name: 'memory_usage_bytes',
        namespace: appName,
        help: 'Heap memory usage of node application in bytes',
        value: process.memoryUsage().heapUsed
    })

    if (process.cpuUsage) {
        let cpuUsage = process.cpuUsage()

        BaseMetrics.gauge({
            name: 'cpu_usage',
            namespace: appName,
            help: 'CPU usage of node application',
            labels: { type: 'user' },
            value: cpuUsage.user
        })

        BaseMetrics.gauge({
            name: 'cpu_usage',
            namespace: appName,
            help: 'CPU usage of node application',
            labels: { type: 'system' },
            value: cpuUsage.system
        })
    }

    let v8HeapStats = v8.getHeapStatistics()
    Object.keys(v8HeapStats).forEach(function(key) {
        let name = key
        if (name.substring(name.length - 4) == 'size') {
            name += '_bytes'
        }

        BaseMetrics.gauge({
            name: name,
            namespace: appName,
            help: 'V8 heap stats',
            value: v8HeapStats[key]
        })
    })
}
setInterval(updateMetrics, 1000)

exports.metrics = BaseMetrics


// prometheus set up with some standard generic useful metrics
// memory usage


function makeLogger(name, sendStdErr) {
    var logger = debug('app.' + name)

    if (sendStdErr) {
        logger.log = console.error.bind(console)
    }

    return function(logKey, data) {
        if (!/^[a-zA-Z0-9.]+$/.test(logKey)) {
            throw new Error(
                'Invalid log key ' + logKey
            )
        }

        const logLine = '[' + appName + '] ' + logKey + ': %o'
        logger(logLine, data || {})
    }
}

exports.logger = {
    debug: makeLogger('debug'),
    info:  makeLogger('info'),
    warn:  makeLogger('warn', true),
    error: makeLogger('error', true)
}


let configOpts = {}
exports.config = {
    set: function(data) {
        configOpts = data;
    },
    get: function(key) {
        if (process.env[key]) {
            let type = configOpts[key] && configOpts[key]['type']
            let value = process.env[key]

            if (type == 'string') {
                return value + ''
            } else if (type == 'int' || type == 'integer') {
                return parseInt(value)
            }

            return value
        }

        if (configOpts[key]['default']) {
            return configOpts[key]['default']
        }

        throw new Error(
            'Invalid config value requested: ' + key
        )
    }
}

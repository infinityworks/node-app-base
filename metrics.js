'use strict'

const v8 = require('v8')
const prometheus = require('prometheus-client-js')

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

function setName(value) {
    appName = value
}

function setStartTime(value) {
    startTime = value
}


let metrics = {}
let client = new prometheus({ port: 9090 })
client.createServer(true)

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
    if (!metrics[data.name]) {
        let metric
        if (type == 'counter') {
            metric = client.createCounter(data)
        } else if (type === 'gauge') {
            metric = client.createGauge(data)
        } else if (type === 'histogram') {
            metric = client.createHistogram(data)
        }
        metrics[data.name] = metric
    }

    let labels = data.labels || {}
    let value = data.value || null

    if (type == 'counter') {
        metrics[data.name].increment(labels)
    } else if (type === 'gauge') {
        metrics[data.name].set(labels, value)
    } else if (type === 'histogram') {
        metrics[data.name].observe(value)
    }
}

function updateMetrics() {
    const value = Math.floor((new Date - startTime) / 1000)

    gauge({
        name: 'uptime_seconds',
        namespace: appName,
        help: 'Lifetime of application in seconds',
        value: value
    })

    gauge({
        name: 'memory_usage_bytes',
        namespace: appName,
        help: 'Heap memory usage of node application in bytes',
        value: process.memoryUsage().heapUsed
    })

    if (process.cpuUsage) {
        let cpuUsage = process.cpuUsage()

        gauge({
            name: 'cpu_usage',
            namespace: appName,
            help: 'CPU usage of node application',
            labels: { type: 'user' },
            value: cpuUsage.user
        })

        gauge({
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

        gauge({
            name: name,
            namespace: appName,
            help: 'V8 heap stats',
            value: v8HeapStats[key]
        })
    })
}
setInterval(updateMetrics, 1000)

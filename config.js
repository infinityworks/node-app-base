'use strict'

module.exports = {
    set: set,
    get: get
}

let configOpts = {}
function set(data) {
    configOpts = data;
}

function get(key) {
    if (process.env[key]) {
        let type = configOpts[key] && configOpts[key]['type']
        let value = process.env[key]
        return parseValue(value, type)
    }

    if (configOpts[key] && configOpts[key]['default']) {
        return configOpts[key]['default']
    }

    throw new Error(
        'Invalid config value requested: ' + key
    )
}

function parseValue(value, type) {
    if (type == 'string') {
        return value + ''
    } else if (type == 'int' || type == 'integer') {
        return parseInt(value)
    } else if (type == 'float') {
        return parseFloat(value)
    }
    return value
}

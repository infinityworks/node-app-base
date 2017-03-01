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

    if (configOpts[key] && typeof configOpts[key]['default'] !== 'undefined' ) {
        return configOpts[key]['default']
    }

    throw new Error(
        'Invalid config value requested: ' + key
    )
}

function parseValue(value, type) {
    switch(type) {
        case 'string':
            return value + ''
        case 'int':
        case 'integer':
            return parseInt(value)
        case 'float':
            return parseFloat(value)
        case 'boolean':
            return (value === 'true' || parseInt(value) === 1)
        default:
            return value
    }
}

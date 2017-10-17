'use strict'

module.exports = () => {
  let configOpts = {}

  function set(data) {
    configOpts = data;
  }

  function get(key) {
    if (process.env[key]) {
      const type = configOpts[key] && configOpts[key]['type']
      const value = process.env[key]
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

  return {
    set: set,
    get: get
  }
}

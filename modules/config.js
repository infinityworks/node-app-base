'use strict'

module.exports = () => {
  let configOpts = {}
  let backend = process.env

  function set(data) {
    configOpts = data;
  }

  function get(key) {
    if (backend[key]) {
      const type = configOpts[key] && configOpts[key]['type']
      const value = backend[key]
      return parseValue(value, type)
    }

    if (configOpts[key] && typeof configOpts[key]['default'] !== 'undefined' ) {
      return configOpts[key]['default']
    }

    if (configOpts[key] && configOpts[key]['required'] === true) {
      throw new Error(
        'Required config value not set: ' + key
      )
    }

    return null;
  }

  function parseValue(value, type) {
    switch(type) {
      case 'string':
        return value + ''
      case 'int':
      case 'integer':
      case 'number':
        return parseInt(value)
      case 'float':
        return parseFloat(value)
      case 'bool':
      case 'boolean':
        return (value === 'true' || parseInt(value) === 1)
      default:
        return value
    }
  }

  function setBackend(value) {
    backend = value
  }

  return {
    set: set,
    get: get,
    setBackend: setBackend
  }
}

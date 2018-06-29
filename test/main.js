'use strict'

const { iterate } = require('leakage')
const assert = require('assert')
const Base = require('../index')

describe('node-base-app', () => {

  let base
  let metrics
  let logger
  let config
  let timers
  let slack

  beforeEach(() => {
    base = Base('test')
    metrics = base.metrics
    logger = base.logger
    config = base.config
    timers = base.timers
    slack = base.slack
  })

  describe('metrics', () => {
    context('when metrics is turned off', () => {
      it('sets the metrics to null', () => {
        base = Base('test2', false);
        assert.equal(base.metrics, null)
      })
    });

    it('presents a metrics interface', () => {
      assert.ok(metrics)
    })
  })

  describe('logger', () => {
    it('presents a logger interface', () => {
      assert.ok(logger)
    })
  })

  describe('config', () => {
    beforeEach(() => {
      config.set({
        NUMBER_DEFAULTED: { type: 'integer', default: 5 },
        NUMBER: { type: 'integer' },
        NUMBER_DEFAULTED_OVERRIDDEN: { type: 'integer', default: 6 },
        NUMBER_OVERRIDDEN : { type: 'integer' },
        NUMBER_REQUIRED: { type: 'integer', required: true },
        STRING_DEFAULT: { type: 'string', default: 'hello' },
        STRING: { type: 'string' },
        STRING_DEFAULT_OVERRIDDEN: { type: 'string', default: 'hello' },
        STRING_OVERRIDDEN: { type: 'string' },
        ZERO_NUMBER: { type: 'integer', default: 0 },
        ONE_NUMBER: { type: 'integer', default: 1 },
        POSITIVE_BOOLEAN: { type: 'boolean', default: true },
        NEGATIVE_BOOLEAN: { type: 'boolean', default: false },
        BOOLEAN_OVERRIDDEN: { type: 'boolean' }
      })

      process.env.NUMBER_DEFAULTED_OVERRIDDEN = '8'
      process.env.NUMBER_OVERRIDDEN = '9'
      process.env.STRING_DEFAULTED_OVERRIDDEN = 'foo'
      process.env.STRING_OVERRIDDEN = 'bar'
      process.env.BOOLEAN_OVERRIDDEN = true
    })

    it('presents a config interface', () => {
      assert.ok(config)
    })

    it('can define default config for number type', () => {
      assert.equal(config.get('NUMBER_DEFAULTED'), 5)
    })

    it('can provide the overriden config for number type', () => {
      assert.equal(config.get('NUMBER_DEFAULTED_OVERRIDDEN'), 8)
    })

    it('can define falsy values as default', () => {
      assert.equal(config.get('ZERO_NUMBER'), 0)
    });

    it('returns null when accessing a non-given value', () => {
      assert.equal(config.get('NUMBER'), null);
    });

    it('returns null when accessing a non-defined value', () => {
      assert.equal(config.get('FOO'), null);
    });

    it('throws an error when accessing a required variable with no value', () => {
      assert.throws(() => {
        config.get('NUMBER_REQUIRED')
      }, Error);
    });

    it('can define a default config for a boolean type', () => {
      assert.equal(config.get('POSITIVE_BOOLEAN'), true)
    });

    it('can provide an overridden boolean as a string', () => {
      assert.equal(config.get('BOOLEAN_OVERRIDDEN'), true)
    });

    it('can define a falsy boolean as a default', () => {
      assert.equal(config.get('NEGATIVE_BOOLEAN'), false)
    });
  })

  describe('timers', () => {
    it('presents a timers interface', () => {
      assert.ok(timers)
    })

    it('returns an integer when stopping a started timer', () => {
      timers.start('foo')
      const actual = timers.stop('foo')
      assert.equal(actual, parseInt(actual, 10))
    })

    it('returns null when stopping an un-started timer', () => {
      assert.equal(timers.stop('bar'), null)
    })

    // This test will take a few seconds to run.
    it('does not leak memory when stopping a timer', () => {
        iterate(() => {
            const label = timers.start();
            const actual = timers.stop(label);
        })
    }).timeout(10000)
  })

  describe('slack', () => {
    it('presents a slack interface', () => {
      assert.ok(slack)
    })

    context('when config is missing', () => {
      it('provides an error when postMessage is called', (done) => {
        slack.postMessage('foo', (err) => {
          assert.ok(err)
          done()
        })
      })
    })
  })

})

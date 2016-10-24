'use strict'

const assert = require('assert')
const base = require('../index')
const config = base.config

describe('node-base-app', () => {

    describe('config', () => {

        before(() => {
            config.set({
                NUMBER_DEFAULTED: { type: 'integer', default: 5 },
                NUMBER: { type: 'integer' },
                NUMBER_DEFAULTED_OVERRIDDEN: { type: 'integer', default: 6 },
                NUMBER_OVERRIDDEN : { type: 'integer' },
                STRING_DEFAULT: { type: 'string', default: 'hello' },
                STRING: { type: 'string' },
                STRING_DEFAULT_OVERRIDDEN: { type: 'string', default: 'hello' },
                STRING_OVERRIDDEN: { type: 'string' },
                ZERO_NUMBER: { type: 'integer', default: 0 },
                ONE_NUMBER: { type: 'integer', default: 1 }
            })

            process.env.NUMBER_DEFAULTED_OVERRIDDEN = 8
            process.env.NUMBER_OVERRIDDEN = 9
            process.env.STRING_DEFAULTED_OVERRIDDEN = 'foo'
            process.env.STRING_OVERRIDDEN = 'bar'
        })

        it('can define default config for number type', () => {
            assert.equal(config.get('NUMBER_DEFAULTED'), 5)
        })

        it('can provide the overriden config for number type', () => {
            assert.equal(config.get('NUMBER_DEFAULTED_OVERRIDDEN'), 8)
        })
    })

})

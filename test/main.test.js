const {iterate} = require('leakage');
const Base = require('../index');

describe('node-base-app', () => {
    const {
        metrics, logger, config, timers, slack, wrappers,
    } = Base('test');

    describe('metrics', () => {
        it('presents a metrics interface', () => {
            expect(metrics).not.toBeUndefined();
        });
    });

    describe('logger', () => {
        it('presents a logger interface', () => {
            expect(logger).not.toBeUndefined();
        });
    });

    describe('config', () => {
        beforeEach(() => {
            config.set({
                NUMBER_DEFAULTED: {type: 'integer', default: 5},
                NUMBER: {type: 'integer'},
                NUMBER_DEFAULTED_OVERRIDDEN: {type: 'integer', default: 6},
                NUMBER_OVERRIDDEN: {type: 'integer'},
                NUMBER_REQUIRED: {type: 'integer', required: true},
                STRING_DEFAULT: {type: 'string', default: 'hello'},
                STRING: {type: 'string'},
                STRING_DEFAULT_OVERRIDDEN: {type: 'string', default: 'hello'},
                STRING_OVERRIDDEN: {type: 'string'},
                ZERO_NUMBER: {type: 'integer', default: 0},
                ONE_NUMBER: {type: 'integer', default: 1},
                POSITIVE_BOOLEAN: {type: 'boolean', default: true},
                NEGATIVE_BOOLEAN: {type: 'boolean', default: false},
                BOOLEAN_OVERRIDDEN: {type: 'boolean'},
            });

            process.env.NUMBER_DEFAULTED_OVERRIDDEN = '8';
            process.env.NUMBER_OVERRIDDEN = '9';
            process.env.STRING_DEFAULTED_OVERRIDDEN = 'foo';
            process.env.STRING_OVERRIDDEN = 'bar';
            process.env.BOOLEAN_OVERRIDDEN = true;
        });

        it('presents a config interface', () => {
            expect(config).not.toBeUndefined();
        });

        it('can define default config for number type', () => {
            expect(config.get('NUMBER_DEFAULTED')).toBe(5);
        });

        it('can provide the overriden config for number type', () => {
            expect(config.get('NUMBER_DEFAULTED_OVERRIDDEN')).toBe(8);
        });

        it('can define falsy values as default', () => {
            expect(config.get('ZERO_NUMBER')).toBe(0);
        });

        it('returns null when accessing a non-given value', () => {
            expect(config.get('NUMBER')).toBeNull();
        });

        it('returns null when accessing a non-defined value', () => {
            expect(config.get('FOO')).toBeNull();
        });

        it('throws an error when accessing a required variable with no value', () => {
            expect(() => config.get('NUMBER_REQUIRED')).toThrow(Error);
        });

        it('can define a default config for a boolean type', () => {
            expect(config.get('POSITIVE_BOOLEAN')).toBe(true);
        });

        it('can provide an overridden boolean as a string', () => {
            expect(config.get('BOOLEAN_OVERRIDDEN')).toBe(true);
        });

        it('can define a falsy boolean as a default', () => {
            expect(config.get('NEGATIVE_BOOLEAN')).toBe(false);
        });
    });

    describe('timers', () => {
        it('presents a timers interface', () => {
            expect(timers).not.toBeUndefined();
        });

        it('returns an integer when stopping a started timer', () => {
            timers.start('foo');
            const actual = timers.stop('foo');
            expect(actual).toBe(parseInt(actual, 10));
        });

        it('returns null when stopping an un-started timer', () => {
            expect(timers.stop('bar')).toBeNull();
        });

        // This test will take a few seconds to run.
        it('does not leak memory when stopping a timer', () => {
            iterate(() => {
                const label = timers.start();
                timers.stop(label);
            });
        });
    });

    describe('slack', () => {
        it('presents a slack interface', () => {
            expect(slack).not.toBeUndefined();
        });

        describe('when config is missing', () => {
            it('provides an error when postMessage is called', (done) => {
                slack.postMessage('foo', (err) => {
                    expect(err).not.toBeNull();
                    done();
                });
            });
        });
    });

    describe('wrappers', () => {
        it('presents a wrappers interface', () => {
            expect(wrappers).not.toBeUndefined();
        });

        describe('async', () => {
            it('returns the response of the operation', async () => {
                const ret = await wrappers.asyncLogsAndTimer('test', () => 'foo');

                expect(ret).toBe('foo');
            });

            it('re-throws the error from the operation', async () => {
                const err = new Error('Test');

                let actualErr;
                try {
                    await wrappers.asyncLogsAndTimer('test', () => {
                        throw err;
                    });
                } catch (thrownErr) {
                    actualErr = thrownErr;
                }

                expect(actualErr).toBe(err);
            });
        });

        describe('sync', () => {
            it('returns the response of the operation', () => {
                const ret = wrappers.logsAndTimer('test', () => 'foo');

                expect(ret).toBe('foo');
            });

            it('re-throws the error from the operation', () => {
                const err = new Error('Test');

                let actualErr;
                try {
                    wrappers.logsAndTimer('test', () => {
                        throw err;
                    });
                } catch (thrownErr) {
                    actualErr = thrownErr;
                }

                expect(actualErr).toBe(err);
            });
        });
    });
});

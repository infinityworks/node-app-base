'use strict'

/*
 * timers.js
 * Collection of functions to accurately measure the speed of your application.
 */

module.exports = () => {
    let startHrTimes = {}

    return {
        timeStart: timeStart,
        timeEnd: timeEnd
    }

    /*
     * Starts the timer for the code section identified by `label`
     * @param {String} label Identifier for the code section
     */
    function start(label) {
        startHrTimes[label] = process.hrtime()
    }

    /*
     * Returns time elapsed in milliseconds since the timer was started for the code section identified by `label`.
     * It also restarts that particular timer.
     * @param {String} label Identifier for the code section
     * @returns {Integer} Elapsed time in milliseconds
     */
    function stop(label) {
        const elapsed = process.hrtime(startHrTimes[label])[1] / 1000000 // Divide by a million to get nano to milli
        startHrTimes[label] = process.hrtime() // Reset the timer

        // TODO -- Right now node-app-base doesn't support floating point values for metrics so we must convert them to integers.
        // We should fix that though.
        return parseInt(elapsed)
    }
}

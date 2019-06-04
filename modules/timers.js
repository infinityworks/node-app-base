/*
 * timers.js
 * Collection of functions to accurately measure the speed of your application.
 *
 * Usage:
 *   const token = start()
 *   // do work
 *   const ms_since_start = stop(token)
 */

module.exports = () => {
    const startHrTimes = {};

    function getRandomString() {
        return `${Math.floor(Math.random() * 1000000000)}`;
    }

    /*
     * Starts the timer for the code section identified by `label`
     * @param {String} label Identifier for the code section, auto-generated if not provided
     * @return {String} Identifier token for the code section
     */
    function start(label) {
        const timerLabel = label || getRandomString();
        startHrTimes[timerLabel] = process.hrtime();
        return timerLabel;
    }

    /*
     * Returns time elapsed in milliseconds since the timer was started for the code section
     * identified by `label`.
     * It also restarts that particular timer.
     * @param {String} label Identifier for the code section
     * @returns {Integer} Elapsed time in milliseconds
     */
    function stop(label) {
        if (!startHrTimes[label]) {
            return null;
        }

        const time = process.hrtime(startHrTimes[label]);
        // add tuple seconds component to nanosecond component and divide by a million to get nano
        // to milli
        const elapsed = (time[0] * 1e9 + time[1]) / 1000000;
        // We're done with this timer, so delete it so as to not leak any memory
        delete startHrTimes[label];

        // TODO -- Right now node-app-base doesn't support floating point values for metrics so we
        //  must convert them to integers.
        // We should fix that though.
        return parseInt(elapsed, 10);
    }

    return {
        start,
        stop,
    };
};

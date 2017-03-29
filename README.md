node-app-base
---

[![Build Status](https://travis-ci.org/infinityworksltd/node-app-base.svg?branch=master)](https://travis-ci.org/infinityworksltd/node-app-base)

Basic utilities for running node microservices

See: https://github.com/infinityworksltd/docker-node-base

## How to use

Require the library and call it as a function, passing in your application name. This returns an object with three components: `config`, `logger` and `metrics`.

```js
const base = require('node-app-base')('example')

const config = base.config
const logger = base.logger
const metrics = base.metrics
const timers = base.timers
const slack = base.slack
```

The library is a singleton, so you can either pass it around through your application or simply call it again passing in the same application name.

See included example application for further details.

## API

```
* config
** set
** get
* metrics
** counter
** gauge
** histogram
* logger
** info
** warn
** error
* timers
** start
** stop
* slack
** postMessage
```

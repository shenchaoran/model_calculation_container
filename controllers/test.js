let path = require('path')
let Promise = require('bluebird')
let fs = Promise.promisifyAll(require('fs'))

fs.statAsync('/asdf')
    .then(stats => {
        stats
    })
    .catch(e => {
        e
    })
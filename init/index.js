let initFolders = require('./init-folder');
let setting = require('../config/setting');
let Promise = require('bluebird');

module.exports = () => {
    return new Promise((resolve, reject) => {
        Promise.all([
            initFolders()
        ])
            .then((rsts) => {
                return resolve(rsts);
            })
            .catch(err => {
                return reject(err);
            })
    });
}
let initFolders = require('./folder.init');
let initLocalIP = require('./local-ip.init');
let setting = require('../config/setting');
let Promise = require('bluebird');

module.exports = () => {
    return new Promise((resolve, reject) => {
        Promise.all([
            initFolders(),
            initLocalIP()
        ])
            .then((rsts) => {
                return resolve(rsts);
            })
            .catch(err => {
                return reject(err);
            })
    });
}
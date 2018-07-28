let Promise = require('bluebird');
let _ = require('lodash');
let fs = require('fs');
let path = require('path');
let setting = require('../config/setting');

let initFolder = (fpath) => {
    return new Promise((resolve, reject) => {
        fs.stat(fpath, (err, stats) => {
            if (err) {
                console.log(`******** Init folder: ${fpath}`);
                if (err.code === 'ENOENT') {
                    fs.mkdir(fpath, err => {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve();
                        }
                    });
                } else {
                    return reject(err);
                }
            } else {
                if (stats.isDirectory()) {
                    return resolve();
                } else {
                    fs.mkdir(fpath, err => {
                        if (err) {
                            console.log(err);
                            return reject(err);
                        } else {
                            return resolve();
                        }
                    });
                }
            }
        });
    });
};

module.exports = () => {
    console.log(__dirname)
    let folders = [
        path.join(__dirname, '../resources'),
        setting.geo_data.path,
        setting.geo_models.path
    ];
    return new Promise((resolve, reject) => {
        Promise.all(_.map(folders, initFolder))
            .then(rsts => {
                return resolve();
            })
            .catch(error => {
                return reject(error);
            });
    });
};
let Promise = require('bluebird');
let path = require('path');
let ObjectID = require('mongodb').ObjectID;
let fs = Promise.promisifyAll(require('fs'));
let unzip = require('unzip');
let setting = require('../config/setting');
let geoDataDB = require('../models/data.model');
let _ = require('lodash');

module.exports = {
    /**
     * 条目保存到数据库，文件移动到geo_data中
     * 如果数据为zip则解压
     */
    insert: (fields, files) => {
        if (!files['myfile']) {
            return Promise.reject('invalid request body!');
        }
        let file = files['myfile'];
        let filename = file.name;
        let ext = filename.substr(filename.lastIndexOf('.'));
        let oid = new ObjectID();
        let newName = oid + ext;

        let newPath = path.join(
            setting.geo_data.path,
            newName
        );
        return fs.renameAsync(file.path, newPath)
            .then(() => {
                return new Promise((resolve, reject) => {
                    if (ext !== '.zip') {
                        return resolve();
                    }
                    let unzipPath = path.join(
                        setting.geo_data.path,
                        oid.toHexString()
                    );
                    fs
                        .createReadStream(newPath)
                        .pipe(unzip.Extract({
                            path: unzipPath
                        }))
                        .on('error', reject)
                        .on('close', () => {
                            // TODO 为什么这里偶尔会崩？？？
                            return resolve();
                        });
                });
            })
            .then(() => geoDataDB.insert({
                _id: oid,
                meta: {
                    name: filename,
                    path: newName,
                    desc: fields.desc
                },
                auth: {
                    src: fields.src,
                    userId: fields.userId
                }
            }))
            .then(doc => Promise.resolve({
                code: 200,
                _id: doc._id
            }))
            .catch(Promise.reject);
    },

    download: (id) => {
        return geoDataDB
                .findOne({
                    _id: id
                })
                .then(doc => {
                    let fpath = path.join(
                        setting.geo_data.path,
                        doc.meta.path,
                    );
                    return new Promise((resolve, reject) => {
                        fs.statAsync(fpath)
                            .then(stats => {
                                return resolve({
                                    path: fpath,
                                    fname: doc.meta.name
                                })
                            })
                            .catch(e => {
                                return reject(e.code === 'ENOENT'? 'file don\'t exist!': 'unpredictable error!');
                            });
                    });
                })
                .catch(Promise.reject);
    }
}
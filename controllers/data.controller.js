let Promise = require('bluebird');
let path = require('path');
let ObjectID = require('mongodb').ObjectID;
let fs = Promise.promisifyAll(require('fs'));
let unzip = require('unzip');
let setting = require('../config/setting');
let geoDataDB = require('../models/data.model');
let _ = require('lodash');
let recordsDB = require('../models/records.model')
let ModelFactory = require('./models/factory')

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
        let oid
        let newName
        if(fields['useNewName'] === 'false') {
            newName = filename
        }
        else {
            oid = new ObjectID()
            newName = oid + ext
        }

        let newPath = path.join(
            setting.geo_data.path,
            newName
        );
        return fs.renameAsync(file.path, newPath)
            .then(() => {
                return Promise.resolve({
                    code: 200
                })
            })
            .catch(Promise.reject);
    },

    downloadById: (id) => {
        return geoDataDB.findOne({
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
    },

    downloadByMSR: (msrId, eventId) => {
        return recordsDB.findOne({_id: msrId})
            .then(msr => {
                let msCtrl = ModelFactory(msr)
                return msCtrl.download(eventId)
            })
            .catch(e => {
                console.error(e)
                return Promise.reject(e)
            })
    }
}
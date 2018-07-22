let Promise = require('bluebird');
let path = require('path');
let ObjectID = require('mongodb').ObjectID;
let fs = Promise.promisifyAll(require('fs'));
let unzip = require('unzip');
let setting = require('../config/setting');
let _ = require('lodash');
let msDB = require('../models/services.model')
let msrDB = require('../models/records.model')
let IBISCtrl = require('./models/IBIS')
let ModelFactory = require('./models/factory')
let child_process = require('child_process')
let exec = child_process.exec
let spawn = child_process.spawn

module.exports = ServicesCtrl = function() {}

ServicesCtrl.prototype.invoke = (calcuTask) => {
    // let doc
    // return msDB.findOne({_id: msId})
    //     .then(v => {
            // doc = v
            // let modelInstance = ModelFactory(doc, IO)
            // return modelInstance.invoke()
        // })
        // .then(stat => {
        //     if(stat.exist) {
        //         return modelInstance.invoke()
        //     }
        //     else {
        //         return Promise.reject('the execuable progrom doesn\'t exist!')
        //     }
        // })
        // 不用保存记录了，比较服务器的后台已经保存过了
        // .then(v => {
        //     rst = v
        //     return msrDB.insert({

        //     })
        // })
    let modelInstance = ModelFactory(calcuTask)
    return modelInstance.invoke()
        .catch(Promise.reject)
}



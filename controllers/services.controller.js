let Promise = require('bluebird');
let path = require('path');
let ObjectID = require('mongodb').ObjectID;
let fs = Promise.promisifyAll(require('fs'));
let unzip = require('unzip');
let setting = require('../config/setting');
let _ = require('lodash');
let msDB = require('../models/services.model')
let msrDB = require('../models/records.model')
let ModelFactory = require('./models/factory')
let child_process = require('child_process')
let exec = child_process.exec
let spawn = child_process.spawn

module.exports = ServicesCtrl = function() {}

ServicesCtrl.prototype.invoke = (calcuTask) => {
    let modelInstance = ModelFactory(calcuTask)
    if(modelInstance.constructorSucceed) {
        return modelInstance.invoke()
            .catch(Promise.reject)
    }
    else {
        return Promise.reject(new Error('invalid calculation task, please check the input configuration!'))
    }
}

const Bluebird = require('bluebird');
const path = require('path');
const ObjectID = require('mongodb').ObjectID;
const fs = Bluebird.promisifyAll(require('fs'));
const unzip = require('unzip');
const setting = require('../config/setting');
const _ = require('lodash');
const msDB = require('../models/services.model')
const msrDB = require('../models/records.model')
const ModelFactory = require('./models/factory')
const child_process = require('child_process')
const exec = child_process.exec
const spawn = child_process.spawn


module.exports = ServicesCtrl = function() {}

ServicesCtrl.prototype.invoke = async (calcuTask) => {
    try {
        let modelInstance = await ModelFactory(calcuTask)
        return modelInstance.invoke().catch(Bluebird.reject)
    }
    catch(e) {
        console.log(e)
        return Bluebird.reject(e)
    }
}

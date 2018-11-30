let CarbonModelBase = require('./Carbon-Model.base')
let Promise = require('bluebird')
let fs = Promise.promisifyAll(require('fs'))
let _ = require('lodash')
let uuidv1 = require('uuid/v1')
let child_process = require('child_process')
let exec = child_process.exec
let spawn = child_process.spawn
let msrDB = require('../../models/records.model')
let path = require('path')
let setting = require('../../config/setting')
let calcuTaskDB = require('../../models/records.model')
let ObjectID = require('mongodb').ObjectID

module.exports = class BIOME_BGC_site extends CarbonModelBase {
    constructor(calcuTask, ms, std) {

    }

    /**
     * msr: 5bede70c17d676c6c3000025
     * 
     */
    invoke() {

    }

    /**
     * 部署时需要把这几个数据拷过去，不要让模型重复计算，巨耗时间
     */
    download(eventId) {
        let fname, fpath;
        if(eventId === '-o') {
            fname = 'IBIS global annual output'
            fpath = '5bfe8d0a27c739cf42f93c1d.nc'
        }
        else if(eventId === '-i') {
            // TODO
            fname = 'IBIS met input'
            fpath = ''
        }
        else if(eventId === '-s') {
            // TODO
            fname = 'IBIS site input'
            fpath = ''
        }
        let stream = fs.createReadStream(path.join(setting.geo_data.path, fpath))
        return { stream, fname }
    }
}
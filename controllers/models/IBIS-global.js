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

module.exports = class IBIS_global extends CarbonModelBase {
    constructor(calcuTask, ms) {
        super(calcuTask, ms)
        this.stdMSRId = '5bede70c17d676c6c3000025'
        if(this.msr.IO.dataSrc === 'STD') {
            
        }
        else {
            // TODO
            this.logsFolder = setting.geo_data.path
            this.logPath = path.join(this.logsFolder, `${this.msr._id}.log`)
        }
    }

    async invoke() {
        // 全部复制这个运行记录的配置
        let stdMSR = await calcuTaskDB.findOne({_id: this.stdMSRId})
        await calcuTaskDB.update({_id: this.msr._id}, {
            $set: {
                IO: stdMSR.IO,
                state: stdMSR.state,
                progress: stdMSR.progress,
                msId: stdMSR.msId,
            }
        })
        return { code: 200 }
    }

    /**
     * 部署时需要把这几个数据拷过去，不要让模型重复计算，巨耗时间
     */
    async download(eventId) {
        let stdMSR = await calcuTaskDB.findOne({_id: this.stdMSRId})
        let events = _.concat(stdMSR.IO.std, stdMSR.IO.outputs)
        let event = _.find(events, event => event.id === eventId)
        let fname = event.fname, 
            fpath = path.join(setting.geo_data.path, event.value + event.ext);
        let stream = fs.createReadStream(fpath)
        return { stream, fname }
    }
}
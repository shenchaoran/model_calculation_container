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
let ObjectID = require('mongodb').ObjectID

/**
 * 模型控制类
 *      方法
 *          调用模型
 *          进度管理
 *      
 *
 * @class IBIS_site
 * @extends {CarbonModelBase}
 */
module.exports = class IBIS_site extends CarbonModelBase {
    constructor(calcuTask, ms) {
        super(calcuTask, ms)
        if (this.msr.IO.dataSrc === 'STD') {
            let index = _.find(calcuTask.IO.std, std => std.id === '--index').value
            let stdId = _.find(calcuTask.IO.std, std => std.id === '--dataset').value
            this.stdPath = path.join(setting.STD_DATA[this.modelName], stdId)
            this.logsFolder = path.join(this.stdPath, 'logs')
            this.recordsPath = path.join(this.stdPath, 'std_records.json')
            if (index) {
                this.index = index
                this.logPath = path.join(this.logsFolder, `${index}_${this.msr._id}.log`)
                this.ios = {
                    '-i': './input/csv/' + index + '_proced.csv',
                    '-o': './output/' + index + '_IBIS_output.txt',
                    '-s': './input/txt/' + index + '.txt'
                }
                for (let key in this.ios) {
                    this.ioFname[key] = path.basename(this.ios[key])
                }
                _.map(this.msr.IO.outputs, output => {
                    output.fname = this.ioFname[output.id]
                })
            }
        } else {
            this.needUpdateSTDRecord = false
            this.logsFolder = setting.geo_data.path
            this.logPath = path.join(this.logsFolder, `${this.msr._id}.log`)
        }
        super.initialization()
    }
}
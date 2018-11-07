let CarbonModelBase = require('./CarbonModel.base')
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
    constructor(calcuTask, ms, std) {
        super(calcuTask, ms, std)

        if (this.stdData) {
            // 前端的 index 由 geoserver + openlayers 获取
            let index = _
                .chain(calcuTask.IO.std)
                .find(item => item.id === '--index')
                .get('value')
                .value()
            if (!index)
                this.constructorSucceed = false
            this.index = index
            this.logPath = path.join(this.logsFolder, `${index}_${this.msr._id}.log`)
            // this.iFname = {
            //     '-i': index + '_proced.csv',
            //     '-s': index + '.txt'
            // }
            this.ios = {
                '-i': './input/csv/' + index + '_proced.csv',
                '-o': './output/' + index + '_IBIS_output.txt',
                '-s': './input/txt/' + index + '.txt'
            }
        } 
        else {
            this.logsFolder = setting.geo_data.path
            this.logPath = path.join(this.logsFolder, `${this.msr._id}.log`)
        }
    }
}
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
    constructor(calcuTask, ms) {
        super(calcuTask, ms)
        if(this.msr.IO.dataSrc === 'STD') {
            let index = _.find(calcuTask.IO.std, std => std.id === '--index').value
            let stdId = _.find(calcuTask.IO.std, std => std.id === '--dataset').value
            this.stdPath = path.join(setting.STD_DATA[this.modelName], stdId)
            this.logsFolder = path.join(this.stdPath, 'logs')
            this.recordsPath = path.join(this.stdPath, 'std_records.json')
            if (index) {
                this.logPath = path.join(this.logsFolder, `${index}_${this.msr._id}.log`)
                this.prefixIO = [this.exePath, '-a']
                let epc = 'shrub';
                let ini = fs.readFileSync(path.join(this.stdPath, `ini/${index}.ini`), 'utf8')
                let rst = /epc\/(.*)\.epc/.exec(ini)
                if(rst)
                    epc = rst[1]
                this.ios = {
                    '--i': `./ini/${index}.ini`,
                    '--m': `./metdata/${index}.mtc43`,
                    '--co2': `./co2/co2.txt`,
                    '--epc': `./epc/${epc}.epc`,
                    '--o': `./outputs/${index}`,                    // 这里其实是一个前缀，下载文件时，要当成两个数据处理
                    '--do': `./outputs/${index}.daily.ascii`,
                    '--ao': `./outputs/${index}.annual-avg.ascii`,
                }
                for (let key in this.ios) {
                    this.ioFname[key] = path.basename(this.ios[key])
                }
            }
        }
        else {
            this.needUpdateSTDRecord = false
            this.logsFolder = setting.geo_data.path
            this.logPath = path.join(this.logsFolder, `${this.msr._id}.log`)
        }
        this.initialization()
    }

    initialization() {
        if (this.msr.IO.dataSrc === 'STD') {
            for (let v of this.prefixIO) {
                this.cmdLine += `${v} `
            }
            for (let key in this.ios) {
                let inPath = path.join(this.stdPath, this.ios[key])
                this.ios[key] = inPath
                this.cmdLine += `${key}=${inPath} `
            }

            _.map(this.msr.IO.inputs, input => {
                input.fname = this.ioFname[input.id]
            })
            _.map(this.msr.IO.outputs, output => {
                output.fname = this.ioFname[output.id]
            })
        }
        else {
            for (let key of this.prefixIO) {
                this.cmdLine += this.prefixIO[key] + ' '
            }
            let oid = this.msr._id.toString()
            // TODO 对输入输出文件的处理
            for (let key in this.msr.IO) {
                if (key !== 'inputs' && key !== 'outputs' && key !== 'parameters')
                    return;
                _.map(this.msr.IO[type], event => {
                    if (event.id === '--do' || event.id === '--ao') {
                        this.ioFname[event.id] = event.fname
                        this.ios[event.id] = path.join(setting.geo_data.path, oid + event.ext)
                    } else {
                        if (type === 'outputs') {
                            event.value = new ObjectID().toHexString();
                        }
                        else if (type === 'parameters') {
                            if (event.value)
                                this.cmdLine += `${event.id}=${event.value}`
                        } else if (event.value && event.value !== '') {
                            let fpath = path.join(setting.geo_data.path, event.value + event.ext);
                            this.ios[event.id] = fpath
                            this.ioFname[event.id] = event.fname
                            this.cmdLine += `${event.id}=${fpath} `
                        }
                    }
                });
            }
            this.cmdLine += `--o=${path.join(setting.geo_data.path, oid)} `
        }
        _.map(this.msr.IO.outputs, output => {
            if (_.lastIndexOf(output.fname, output.ext) === -1) {
                output.fname += output.ext
            }
            let reg = new RegExp(`(${output.ext})+$`)
            output.fname = output.fname.replace(reg, output.ext)
        })
        this.exePath = 'node';
    }
}
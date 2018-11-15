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
let calcuTaskDB = require('../../models/records.model')
let ObjectID = require('mongodb').ObjectID

module.exports = class BIOME_BGC_site extends CarbonModelBase {
    constructor(calcuTask, ms, std) {
        super(calcuTask, ms, std)
        if (this.stdData) {
            let index = _
                .chain(calcuTask.IO.std)
                .find(item => item.id === '--index')
                .get('value')
                .value()
            if (!index)
                this.constructorSucceed = false
            this.logPath = path.join(this.logsFolder, `${index}_${this.msr._id}.log`)
            this.prefixIO = ['-a']
            // TODO 
            //      spinup
            //      output 2 file
            this.ioFname = {}
            this.ios = {
                '--i': `./ini/${index}.ini`,
                '--m': `./metdata/${index}.mtc43`,
                '--ri': `./restart/${index}.endpoint`,
                '--ro': `./restart/${index}.endpoint`,
                '--co2': `./co2/co2.txt`,
                '--epc': `./epc/shrub.epc`,
                '--o': `./outputs/${index}`,         // TODO 这里其实是一个前缀，下载文件时，要当成两个数据处理
                '--do': `./outputs/${index}.daily.ascii`,
                '--ao': `./outputs/${index}.annual.ascii`,
                '--aao': `./outputs/${index}.annual-avg.ascii`,
                '--mao': `./outputs/${index}.monthly-avg.ascii`,
                '--so': `./outputs/${index}.summary.ascii`,
            }
            // 输出文件的后缀，
            // this.oSuffix = {
            //     '--do': '.dayout.ascii',
            //     '--ao': '.annout.ascii'
            // }
        } else {
            this.logsFolder = setting.geo_data.path
            this.logPath = path.join(this.logsFolder, `${this.msr._id}.log`)
        }
    }

    initialization() {
        for (let key in this.ios) {
            this.ioFname[key] = path.basename(this.ios[key])
        }
        if (this.stdData && this.msr.IO.dataSrc === 'STD') {
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
        } else {
            for (let key of this.prefixIO) {
                this.cmdLine += this.prefixIO[key] + ' '
            }
            let oid = this.msr._id
            if (typeof oid !== 'string') {
                oid = oid.toHexString()
            }
            // TODO 对输入输出文件的处理
            for (let key in this.msr.IO) {
                if (key !== 'inputs' || key !== 'outputs' || key !== 'parameters')
                    return;
                _.map(this.msr.IO[type], event => {
                    if (event.id === '--do' || event.id === '--ao') {
                        this.ioFname[event.id] = event.fname
                        this.ios[event.id] = path.join(setting.geo_data.path, oid + event.ext)
                    } else {
                        if (type === 'outputs') {
                            event.value = new ObjectID().toHexString();
                        }
                        if (type === 'parameters') {
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
        return calcuTaskDB.update({
            _id: this.msr._id
        }, {
            $set: {
                'IO.inputs': this.msr.IO.inputs,
                'IO.outputs': this.msr.IO.outputs
            }
        })
    }

    /**
     * TODO 由于运行时只输入了一个 前缀，所以下载时，要映射到每个输出项上
     */
    // download() {

    // }
}
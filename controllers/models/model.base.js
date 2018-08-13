let Promise = require('bluebird')
let fs = Promise.promisifyAll(require('fs'))
let _ = require('lodash')
let uuidv1 = require('uuid/v1')
let child_process = require('child_process')
let exec = child_process.exec
let spawn = child_process.spawn
let calcuTaskDB = require('../../models/records.model')
let path = require('path')
let setting = require('../../config/setting')
let RequestUtil = require('../../utils/request.utils')


/**
 * 这里有两个文件标识：
 *      模型文件夹里的 versions.json，用来标识根据参数 (STD_Data.parameters) 动态编译出来的模型版本信息，主要是针对 IBIS_2.6b4
 *          [{
 *              exeName,
 *              parameters: this.std.parameters
 *          }]
 *      标准数据集文件夹下的 std_records.json，用来标识使用标准数据集的运行记录，避免重复计算。标识源是 IO.std(运行坐标、区域) 以及 IO.parameters(模型运行参数配置)
 *          [{
 *              msrId,
 *              std: this.msr.IO.std,
 *              parameters: this.msr.IO.parameters
 *          }]
 */
module.exports = class ModelBase {
    constructor(calcuTask) {
        this.modelName = calcuTask.ms.MDL.meta.name
        this.folder = path.join(setting.geo_models.path, this.modelName + '_' + calcuTask.ms._id)
        this.exeName = calcuTask.ms.exeName
        this.exePath = path.join(this.folder, this.exeName)
        this.cwd = path.join(this.folder)

        // exe 运行时，需要配置的输入输出，如：myexe --input=inputFilePath
        this.ios = {}
        // 使用std data时，用于更新 msr 的 fname
        this.ioFname = {}
        // exe 运行时，没有值的配置项，如：git -h
        this.prefixIO = []

        this.ms = calcuTask.ms
        this.msr = calcuTask
        this.stdData = calcuTask.std

        this.constructorSucceed = true
        if(this.stdData && this.msr.IO.dataSrc === 'STD') {
            this.stdPath = path.join(setting.STD_DATA[this.modelName], this.stdData._id)
            this.logsFolder = path.join(this.stdPath, 'logs')
            this.recordsPath = path.join(this.stdPath, 'std_records.json')
            this.needUpdateSTDRecord = undefined
        }
        else {
            this.needUpdateSTDRecord = false
        }
        this.cmdLine = ''
    }

    /**
     * 调用 public 函数前应该先调次函数
     * 1. 完善构造 msr 时 IO 里 fname 或 value 的不完整，并更新到数据库中
     * 2. 求 cmdLine 和 ios
     */
    initialization() {
        for(let key in this.ios) {
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
            // TODO 对输入输出文件的处理
            let joinIOStr = (type) => {
                _.map(this.msr.IO[type], event => {
                    if (type === 'outputs') {
                        event.value = new ObjectID().toHexString();
                    }
                    if (type === 'parameters') {
                        if (event.value)
                            this.cmdLine += `${event.id}=${event.value}`
                    }
                    else if (event.value && event.value !== '') {
                        let fpath = path.join(setting.geo_data.path, event.value + event.ext);
                        this.ios[event.id] = fpath
                        this.ioFname[event.id] = event.fname
                        this.cmdLine += `${event.id}=${fpath} `
                    }
                });
            }
            joinIOStr('inputs');
            joinIOStr('outputs');
            joinIOStr('parameters');
        }
        _.map(this.msr.IO.outputs, output => {
            if(_.lastIndexOf(output.fname, output.ext) === -1) {
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
     * resolve:
     *      return { code }
     * reject:
     *      return err
     */
    invoke() {
        if (this.exePath) {
            this.initialization()
                .then(() => this.invokeAndDaemon())
            return Promise.resolve({
                code: 200
            })
        } else {
            return Promise.reject('the execuable progrom doesn\'t exist!')
        }
    }

    /**
     * private
     * 调用模型，同时根据 stdout 监听模型运行的进度，将进度保存到 DB 中
     */
    invokeAndDaemon() {
        this.hadRunned()
            .then(msrId => {
                if (msrId) {
                    calcuTaskDB.findOne({
                        _id: msrId
                    })
                    .then(doc => {
                        return calcuTaskDB.update({
                            _id: this.msr._id
                        }, {
                            $set: {
                                IO: doc.IO,
                                state: doc.state,
                                progress: doc.progress
                            }
                        })
                    })
                    .catch(e => {
                        console.log(e)
                    })
                } else {
                    let group = _.filter(this.cmdLine.split(/\s+/), str => str.trim() !== '');
                    // console.log(this.cmdLine);
                    let updateProgress = (status) => {
                        this.msr.state = status
                        switch (this.msr.state) {
                            case 'FINISHED_SUCCEED':
                                this.msr.progress = 100
                                this.emitCacheDataMsg()
                                break
                            case 'RUNNING':
                                this.msr.progress = this.msr.progress> 100? 100: this.msr.progress
                                break
                            case 'FINISHED_FAILED':
                                break
                        }

                        calcuTaskDB.update({
                            _id: this.msr._id
                        }, {
                            $set: {
                                state: this.msr.state,
                                progress: this.msr.progress
                            }
                        })
                    }

                    // IBIS_26b4 运行是如果数据是使用 ～ 来表示路径时就会出错，而是用/home/shencr不会出错
                    const cp = spawn(`${this.exePath}`, group);
                    console.info(this.exePath, '\n', this.cmdLine)

                    let ws = fs.createWriteStream(this.logPath)
                    cp.stdout.pipe(ws)
                    cp.stderr.pipe(ws)

                    if (this.needUpdateSTDRecord) {
                        fs.readFileAsync(this.recordsPath, 'utf-8')
                            .then(buf => {
                                let str = buf.toString()
                                let newStr
                                try {
                                    if (_.trim(str) === '') {
                                        str = '[]'
                                    }
                                    let records = JSON.parse(str)
                                    records.push({
                                        msrId: this.msr._id,
                                        parameters: this.msr.IO.parameters,
                                        std: this.msr.IO.std
                                    })
                                    newStr = JSON.stringify(records)
                                } catch (e) {
                                    newStr = str
                                }
                                return fs.writeFileAsync(this.recordsPath, newStr)
                            })
                            .catch(e => {
                                if (e) {
                                    console.log(e)
                                }
                            })
                    }

                    cp.stdout.on('data', data => {
                        let str = data.toString();
                        if (str.indexOf(setting.invoke_failed_tag) !== -1) {
                            updateProgress('FINISHED_FAILED');
                        } else {
                            // 更新 process
                            let group = str.match(setting.progressReg);
                            let progress = group ? group[group.length - 1] : undefined;
                            if (progress) {
                                console.log('Progress: ', progress);
                                this.msr.progress = parseFloat(progress)
                                updateProgress('RUNNING');
                            }
                        }
                    });
                    cp.stderr.on('data', data => {
                        // 
                        console.log(data.toString());
                        // 这里不算崩掉
                        // updateRecord('failed');
                    });
                    cp.on('close', code => {
                        console.log(`********${this.modelName} finished code: ${code}`, '\t', code === 0 ? 'succeed' : 'failed');
                        if (code === 0) {
                            updateProgress('FINISHED_SUCCEED');
                        } else {
                            updateProgress('FINISHED_FAILED');
                        }
                    });
                }
            })
            .catch(e => {
                console.log(e)
            })
    }

    /**
     * private
     * return msrId/undefined
     *      
     * 使用标准数据集时，根据参数判断是否运行过
     *      运行记录存在标准数据集下的 std_records.json 中
     *       [
     *          {
     *              msrId,
     *              parameters: []
     *          }
     *       ]
     */
    hadRunned() {
        return Promise.resolve(undefined)
        if (this.msr.IO.dataSrc !== 'STD') {
            return Promise.resolve(undefined)
        }
        else {
            return new Promise((resolve, reject) => {
                fs.readFileAsync(this.recordsPath, 'utf-8')
                    .then(buf => {
                        let str = buf.toString()
                        if (_.trim(str) === '')
                            str = '[]'
                        let records = JSON.parse(str)
                        let record = _.find(records, {
                            parameters: this.msr.IO.parameters,
                            std: this.msr.IO.std
                        })
                        if (record) {
                            return resolve(record.msrId)
                        } else {
                            this.needUpdateSTDRecord = true
                            return resolve(undefined)
                        }
                    })
                    .catch(e => {
                        this.needUpdateSTDRecord = true
                        if (e.code === 'ENOENT') {
                            return fs.writeFileAsync(this.recordsPath, '[]')
                                .then(() => {
                                    return resolve(undefined)
                                })
                                .catch(e => {
                                    return resolve(undefined)
                                })
                        } else {
                            return resolve(undefined)
                        }
                    })
            })
        }
    }

    download(eventId) {
        return this.initialization()
            .then(() => {
                let fpath, fname
                if (eventId === 'log') {
                    if(this.stdData) {

                    }
                    else {
                        
                    }
                    fpath = this.logPath
                    fname = path.basename(fpath)
                } else {
                    fpath = this.ios[eventId]
                    fname = this.ioFname[eventId]
                }
                return Promise.resolve({
                    stream: fs.createReadStream(fpath),
                    fname: fname
                })
            })
            .catch(Promise.reject)
    }

    emitCacheDataMsg() {
        let url = `http://${setting.portal.host}:${setting.portal.port}/nodes/cache-data/${this.msr._id}`
        RequestUtil.getByServer(url)
            .then(res => {
                res = JSON.parse(res)
                if(!res.error) {
                    console.log('******* Start cache data of msr: ' + this.msr._id)
                }
            })
    }
}
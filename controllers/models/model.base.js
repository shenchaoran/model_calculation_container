let Bluebird = require('bluebird')
let fs = Bluebird.promisifyAll(require('fs'))
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
    constructor(calcuTask, ms) {
        this.modelName = ms.MDL.meta.name
        this.folder = path.join(setting.geo_models.path, this.modelName.replace(/\s/g, '-') + '_' + ms._id)
        this.exeName = ms.exeName
        this.exePath = path.join(this.folder, this.exeName)
        this.cwd = path.join(this.folder)

        // exe 运行时，需要配置的输入输出，如：myexe --input=inputFilePath
        this.ios = {}
        // 使用std data时，用于更新 msr 的 fname
        this.ioFname = {}
        // exe 运行时，没有值的配置项，如：git -h
        this.prefixIO = []
        this.cmdLine = ''

        this.ms = ms
        this.msr = calcuTask
    }

    /**
     * 初始化: cmdLine, logPath, recordsPath, ios, ioFname
     * 
     * 1. 完善构造 msr 时 IO 里 fname 或 value 的不完整，并更新到数据库中
     * 2. 求 cmdLine 和 ios
     */
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
        } else {
            for (let key of this.prefixIO) {
                this.cmdLine += this.prefixIO[key] + ' '
            }
            // TODO 对输入输出文件的处理
            for (let key in this.msr.IO) {
                if (key !== 'inputs' && key !== 'outputs' && key !== 'parameters')
                    return;
                _.map(this.msr.IO[type], event => {
                    if (type === 'outputs') {
                        event.value = new ObjectID().toHexString();
                    } else if (type === 'parameters') {
                        if (event.value)
                            this.cmdLine += `${event.id}=${event.value}`
                    } else if (event.value) {
                        let fpath = path.join(setting.geo_data.path, event.value + event.ext);
                        this.ios[event.id] = fpath
                        this.ioFname[event.id] = event.fname
                        this.cmdLine += `${event.id}=${fpath} `
                    }
                });
            }
        }
        _.map(this.msr.IO.outputs, output => {
            if (_.lastIndexOf(output.fname, output.ext) === -1) {
                output.fname += output.ext
            }
            let reg = new RegExp(`(${output.ext})+$`)
            output.fname = output.fname.replace(reg, output.ext)
        })
    }

    /**
     * resolve:
     *      return { code }
     * reject:
     *      return err
     */
    async invoke() {
        try {
            if (this.exePath) {
                await calcuTaskDB.update({
                    _id: this.msr._id
                }, {
                    $set: {
                        'IO.inputs': this.msr.IO.inputs,
                        'IO.outputs': this.msr.IO.outputs
                    }
                })
                this.invokeAndDaemon();
                return { code: 200 }
            } else {
                return Bluebird.reject('the execuable progrom doesn\'t exist!')
            }
        } catch (e) {
            return Bluebird.reject(e)
        }
    }

    /**
     * private
     * 调用模型，同时根据 stdout 监听模型运行的进度，将进度保存到 DB 中
     */
    async invokeAndDaemon() {
        try {
            let hadRunned = await this.hadRunned()
            if (hadRunned) {
                let doc = await calcuTaskDB.findOne({ _id: msrId })
                return calcuTaskDB.update({ _id: this.msr._id }, {
                    $set: {
                        IO: doc.IO,
                        state: doc.state,
                        progress: doc.progress
                    }
                })
            } else {
                let group = _.filter(this.cmdLine.split(/\s+/), str => str.trim() !== '');
                // console.log(this.cmdLine);
                let updateProgress = async status => {
                    this.msr.state = status
                    switch (this.msr.state) {
                        case 'FINISHED_SUCCEED':
                            this.msr.progress = 100
                            break
                        case 'RUNNING':
                            this.msr.progress = this.msr.progress > 100 ? 100 : this.msr.progress
                            break
                        case 'FINISHED_FAILED':
                            break
                    }

                    await calcuTaskDB.update({
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
                    let buf = await fs.readFileAsync(this.recordsPath, 'utf8')
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
                    fs.writeFileAsync(this.recordsPath, newStr)
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
        } catch (e) {
            console.log(e)
        }
    }

    /**
     * private
     * return msrId/undefined
     */
    async hadRunned() {
        try {
            if (this.msr.IO.dataSrc !== 'STD') {
                return undefined;
            } else {
                try {
                    await fs.accessAsync(this.ios[this.hadRunnedOutputKey], fs.constants.F_OK)
                    return true;
                } catch (e) {
                    return false;
                }
            }
        } catch (e) {
            return Bluebird.reject(e)
        }
    }

    async download(eventId) {
        try {
            let fpath, fname
            if (eventId === 'log') {
                fpath = this.logPath
                fname = path.basename(fpath)
            } else {
                fpath = this.ios[eventId]
                fname = this.ioFname[eventId]
            }
            let stream = fs.createReadStream(fpath)
            return {
                stream,
                fname
            }
        } 
        catch(e) {
            console.log(e)
            return Bluebird.reject(e)
        }
    }
}
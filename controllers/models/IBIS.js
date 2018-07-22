let CarbonModelBase = require('./CarbonModel.base')
let Promise = require('bluebird')
let fs = Promise.promisifyAll(require('fs'))
let _ = require('lodash')
let uuidv1 = require('uuid/v1')
let exec = child_process.exec
let spawn = child_process.spawn
let msrDB = require('../../models/records.model')

/**
 * 模型控制类
 *      方法
 *          调用模型
 *          进度管理
 *      
 *
 * @class IBIS
 * @extends {CarbonModelBase}
 */
module.exports = class IBIS extends CarbonModelBase {
    constructor(calcuTask) {
        this.folder = path.join(setting.geo_models.path, this.calcuTask.ms.path)
        this.exeName = undefined
        this.exePath = undefined
        this.cwd = path.join(this.folder, 'debug')
        this.cmdLine = undefined

        this.ms = calcuTask.ms
        this.msr = calcuTask
        this.stdData = calcuTask.stdData
    }

    static getIO() {
        
    }

    /**
     * resolve:
     *      return {
     *           path: string
     *      }
     * reject: 
     *      return err (unexist)
     */
    static statEXE() {
        let compileParas = {}
        if(this.msr.IO.dataSrc === 'STD') {
            // get compileParas by STD dataset

        }
        else {
            _.map(this.msr.IO.parameters, p => {
                if(/--nlat=|--nlon=|--npoi=|--xres=|--yres=/.test(p.id)) {
                    compileParas[p.id] = p.value
                }
            })
        }
        
        let versionPath = path.join(this.folder, 'versions.json')
        return fs.readFileAsync(versionPath, 'utf-8')
            .then(buf => {
                let versions = JSON.parse(buf.toString())
                let thisVersion = _.find(versions, compileParas)
                if(thisVersion) {
                    this.exePath = path.join(this.folder, 'debug', thisVersion.exeName)
                    this.exeName = thisVersion.exeName
                    return Promise.resolve(this.exePath)
                }
                else {
                    let exeName = 'IBIS_2.6b4_' + uuidv1()
                    this.exePath = path.join(this.folder, 'debug', exeName)
                    let newVersion = {
                        exeName: exeName,
                        ...compileParas
                    }
                    // modify sources(compar.h and makefile) -> compile -> add db record
                    let comparPath = path.join(this.folder, 'src/compar.h')
                    let makefilePath = path.join(this.folder, 'makefile')
                    return Promise.map([
                        // modify and save compar.h
                        fs.readFileAsync(comparPath, 'utf-8')
                            .then(buf => {
                                let str = buf.toString()
                                let comparFlag = '---modify_flag_of_auto_compile---'
                                let startI = str.indexOf(comparFlag)
                                let endI = str.lastIndexOf(comparFlag)
                                let substr = str.substring(startI, endI)
                                let newstr = _.cloneDeep(substr)
                                newstr.replace(/(\w+)\s*=\s*((\d+|\.)*)/mg, function(match, $1, $2) {
                                    return `${$1} = ${compileParas[$1]? compileParas[$1]: $2}`
                                })
                                str = str.replace(substr, newstr)
                                return Promise.resolve(str)
                            })
                            .then(str => {
                                return fs.writeFileAsync(comparPath, str)
                            }),
                        // modify and save makefile
                        fs.readFileAsync(makefilePath, 'utf-8')
                            .then(buf => {
                                let str = buf.toString()
                                str.replace(/(EXENAME\s*=\s*)((\w+|\d+|\.|\-|\_)*)/s, `$1${newVersion.exeName}`)
                                return Promise.resolve(str)
                            })
                            .then(str => {
                                return fs.writeFileAsync(makefilePath, str)
                            })
                    ])
                        .then(() => {
                            // recompile
                            return new Promise((resolve, reject) => {
                                exec('make', {
                                    cwd: this.folder
                                }, (err, stdout, stderr) => {
                                    if(err) {
                                        console.log(err)
                                        reject(err)
                                    }
                                    if(stdout) {
                                        resolve()
                                    }
                                    if(stderr) {
                                        reject(stderr)
                                    }
                                })
                            });
                        })
                        .then(() => {
                            versions.push(thisVersion)
                            return fs.writeFileAsync(versionPath, JSON.stringify(versions))
                        })
                        .then(() => Promise.resolve(this.exePath))
                        .catch(Promise.reject)
                }
            })
    }

    /**
     * resolve:
     *      return { code }
     * reject:
     *      return err
     * @static
     * @memberof IBIS
     */
    static invoke() {
        return this.statEXE()
            .then(stats => {
                if(stats.exist) {
                    return Promise.resolve()
                }
                else {
                    return Promise.reject('the execuable progrom doesn\'t exist!')
                }
            })
            .then(() => {
                let 
                if(this.msr.IO.dataSrc === 'STD') {

                }
                else {

                }
                
                this.invokeAndDaemon()
            })
            .catch(e => {
                console.log(e)
                return Promise.reject(e)
            })
    }
}
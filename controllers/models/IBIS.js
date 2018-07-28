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
        super()
        this.modelName = 'IBIS_2.6b4'

        this.folder = path.join(setting.geo_models.path, this.modelName + '_' + calcuTask.ms._id)
        this.exeName = undefined
        this.exePath = undefined
        this.cwd = path.join(this.folder, 'debug')
        this.cmdLine = undefined
        this.stdPath = undefined

        this.ms = calcuTask.ms
        this.msr = calcuTask
        this.stdData = calcuTask.std
    }

    /**
     * 获取调用模型的字符串
     * return msrId
     */
    getIOstr() {
        if(this.msr.IO.dataSrc === 'STD') {
            this.stdPath = path.join(setting.STD_DATA[this.modelName], this.stdData._id)
            // 对于标准数据集，运行过后生成一个 flag空文件，下次就不运行了：文件结构如下
            // [
            //     {
            //         msrId,
            //         parameters: []
            //     }
            // ]
            let recordsPath = path.join(this.stdPath, 'std_records.json')
            return new Promise((resolve, reject) => {
                fs.readFileAsync(recordsPath, 'utf-8')
                    .then(buf => {
                        let invokeParas = this.msr.IO.parameters
                        let records = JSON.parse(buf.toString())
                        let record = _.find(records, {
                            parameters: invokeParas
                        })
                        if(record) {
                            return resolve(record.msrId)
                        }
                        else {
                            return resolve(false)
                        }
                    })
                    .catch(e => {
                        return resolve(false)
                    })
            })
                .then(msrId => {
                    if(msrId) {
                        return Promise.resolve(msrId)
                    }
                    else {
                        let ios = {
                            ini_infile_: './input/ibis.infile',
                            diag_infile_: './input/diag.infile',
                            cld_mon_: './input/cld.mon.nc',
                            deltat_mon_: './input/deltat.nc',
                            prec_mon_: './input/prec.mon.nc',
                            rh_mon_: './input/rh.mon.nc',
                            temp_mon_: './input/temp.mon.nc',
                            trange_mon_: './input/trange.mon.nc',
                            wetd_mon_: './input/wetd.mon.nc',
                            wspd_mon_: './input/wspd.mon.nc',
                            soita_sand_: './input/soita.sand.nc',
                            soita_clay_: './input/soita.clay.nc',
                            vegtype_: './input/vegtype.nc',
                            surta_: './input/surta.nc',
                            topo_: './input/topo.nc',
                            deltat_: './input/deltat.nc',
                            params_can_: './params/params.can',
                            params_hyd_: './params/params.hyd',
                            params_soi_: './params/params.soi',
                            params_veg_: './params/params.veg',
                            out_yearly_aet_: './output/yearly/aet.nc',
                            out_yearly_biomass_: './output/yearly/biomass.nc',
                            out_yearly_co2fluxes_: './output/yearly/co2fluxes.nc',
                            out_yearly_csoi_: './output/yearly/csoi.nc',
                            out_yearly_disturbf_: './output/yearly/disturbf.nc',
                            out_yearly_exist_: './output/yearly/exist.nc',
                            out_yearly_fcover_: './output/yearly/fcover.nc',
                            out_yearly_npp_: './output/yearly/npp.nc',
                            out_yearly_nsoi_: './output/yearly/nsoi.nc',
                            out_yearly_plai_: './output/yearly/plai.nc',
                            out_yearly_runoff_: './output/yearly/runoff.nc',
                            out_yearly_sens_: './output/yearly/sens.nc',
                            out_yearly_tsoi_: './output/yearly/tsoi.nc',
                            out_yearly_vegtype0_: './output/yearly/vegtype0.nc',
                            out_yearly_wsoi_: './output/yearly/wsoi.nc',
                            out_yearly_zcanopy_: './output/yearly/zcanopy.nc',
                            out_yearly_sapfrac_: './output/yearly/sapfrac.nc',
                            out_yearly_dummyv_: './output/yearly/dummyv.nc',
                            out_yearly_solar_: './output/yearly/solar.nc',
                            out_yearly_albedo_: './output/yearly/albedo.nc',
                            out_yearly_latent_: './output/yearly/latent.nc',
                            out_yearly_totfall_: './output/yearly/totfall.nc',
                            out_yearly_clitw_: './output/yearly/clitw.nc',
                            out_yearly_csoislo_: './output/yearly/csoislo.nc',
                            out_yearly_csoipas_: './output/yearly/csoipas.nc',
                            out_monthly_aet_: './output/monthly/aet.nc',
                            out_monthly_cloud_: './output/monthly/cloud.nc',
                            out_monthly_co2ratio_: './output/monthly/co2ratio.nc',
                            out_monthly_ir_: './output/monthly/ir.nc',
                            out_monthly_lai_: './output/monthly/lai.nc',
                            out_monthly_latent_: './output/monthly/latent.nc',
                            out_monthly_npptot_: './output/monthly/npptot.nc',
                            out_monthly_qa_: './output/monthly/qa.nc',
                            out_monthly_rain_: './output/monthly/rain.nc',
                            out_monthly_rh_: './output/monthly/rh.nc',
                            out_monthly_runoff_: './output/monthly/runoff.nc',
                            out_monthly_sens_: './output/monthly/sens.nc',
                            out_monthly_snod_: './output/monthly/snod.nc',
                            out_monthly_snof_: './output/monthly/snof.nc',
                            out_monthly_snow_: './output/monthly/snow.nc',
                            out_monthly_solar_: './output/monthly/solar.nc',
                            out_monthly_temp_: './output/monthly/temp.nc',
                            out_monthly_tsoi_: './output/monthly/tsoi.nc',
                            out_monthly_wsoi_: './output/monthly/wsoi.nc',
                            out_monthly_albedo_: './output/monthly/albedo.nc',
                            out_monthly_dummyv_: './output/monthly/dummyv.nc',
                            out_daily_rain_: './output/daily/rain.nc',
                            out_daily_cloud_: './output/daily/cloud.nc',
                            out_daily_rh_: './output/daily/rh.nc',
                            out_daily_snow_: './output/daily/snow.nc',
                            out_daily_aet_: './output/daily/aet.nc',
                            out_daily_trunoff_: './output/daily/trunoff.nc',
                            out_daily_srunoff_: './output/daily/srunoff.nc',
                            out_daily_drainage_: './output/daily/drainage.nc',
                            out_daily_wsoi_: './output/daily/wsoi.nc',
                            out_daily_wisoi_: './output/daily/wisoi.nc',
                            out_daily_snod_: './output/daily/snod.nc',
                            out_daily_snof_: './output/daily/snof.nc',
                            out_daily_co2ratio_: './output/daily/co2ratio.nc',
                            out_daily_co2mic_: './output/daily/co2mic.nc',
                            out_daily_templ_: './output/daily/templ.nc',
                            out_daily_zcanopy_: './output/daily/zcanopy.nc',
                            out_daily_laicanopy_: './output/daily/laicanopy.nc',
                            out_global_: './output/ibis.out.global',
                            out_vegtype_: './output/ibis.out.vegtype',
                            out_yearsrun_: './output/ibis.out.yearsrun',
                            out_diag_0_: './output/diag/0',
                            out_diag_1_: './output/diag/1',
                            out_diag_2_: './output/diag/2',
                            out_diag_3_: './output/diag/3',
                            out_diag_4_: './output/diag/4',
                            out_diag_5_: './output/diag/5',
                            out_diag_6_: './output/diag/6',
                            out_diag_7_: './output/diag/7',
                            out_diag_8_: './output/diag/8',
                            out_diag_9_: './output/diag/9'
                        }
                        let IOstr = ''
                        for(let key in ios) {
                            let inPath = path.join(this.stdPath, ios[key])
                            IOstr += `--${key}=${inPath} `
                        }
                        this.cmdLine = IOstr
                        return Promise.resolve(undefined)
                    }
                })
        }
        else {
            let IOstr = '';
            let geodata = [];
            // TODO 对输入输出文件的处理
            let joinIOStr = (type) => {
                _.map(this.msr.IO[type], event => {
                    if (type === 'outputs') {
                        event.fname = _.cloneDeep(event.value);
                        let i = _.lastIndexOf(event.fname, event.ext);
                        if (i === -1) {
                            event.fname += event.ext;
                        }
                        event.value = new ObjectID().toHexString();
                    }
                    if (event.value && event.value !== '') {
                        let fpath = path.join(setting.geo_data.path, event.value + event.ext);
                        IOstr += `${event.id}=${fpath} `;
                    }
                    if (type !== 'parameters') {
                        // event.url = `/data/${event.value}`;
                    }
                });
            }
            joinIOStr('inputs');
            joinIOStr('outputs');
            joinIOStr('parameters');

            this.cmdLine = IOstr
            return Promise.resolve(undefined)
        }
    }

    /**
     * resolve:
     *      path: string
     * reject: 
     *      err (unexist)
     */
    statEXE() {
        let compileParas = {}
        if(this.msr.IO.dataSrc === 'STD') {
            // get compileParas by STD dataset
            compileParas = this.stdData.parameters
        }
        else {
            _.map(this.msr.IO.parameters, p => {
                if(/--nlat=|--nlon=|--npoi=|--xres=|--yres=/.test(p.id)) {
                    let key = p.id.match(/(-|--)(.*)/)[2]
                    compileParas[key] = p.value
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
                    return Promise.all([
                        // modify and save compar.h
                        fs.readFileAsync(comparPath, 'utf-8')
                            .then(buf => {
                                let str = buf.toString()
                                let comparFlag = 'c---modify_flag_of_auto_compile---'
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
                                let newStr = str.replace(/(EXENAME\s*=\s*)((\w+|\d+|\.|\-|\_)*)/s, `$1${newVersion.exeName}`)
                                return Promise.resolve(newStr)
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
                            versions.push(newVersion)
                            return fs.writeFileAsync(versionPath, JSON.stringify(versions))
                        })
                        .then(() => Promise.resolve(this.exePath))
                        .catch(e => {
                            console.log(e)
                            Promise.reject(e)
                        })
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
        return this.statEXE()
            .then(exePath => {
                if(exePath) {
                    this.invokeAndDaemon()
                    return Promise.resolve({ code: 200} )
                }
                else {
                    return Promise.reject('the execuable progrom doesn\'t exist!')
                }
            })
            .catch(e => {
                console.log(e)
                return Promise.reject(e)
            })
    }
}
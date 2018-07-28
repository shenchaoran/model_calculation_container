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

module.exports = class ModelBase {
    /**
     * 调用模型，同时根据 stdout 监听模型运行的进度，将进度保存到 DB 中
     */
    invokeAndDaemon() {
        this.getIOstr()
            .then(msrId => {
                if(msrId) {
                    calcuTaskDB.findOne({_id: msrId})
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
                }
                else {
                    let group = _.filter(this.cmdLine.split(/\s+/), str => str.trim() !== '');
                    // console.log(this.cmdLine);
                    let updateRecord = (type, progress) => {
                        if (progress) {
                            this.msr.progress = progress;
                            this.msr.state = progress >= 100 ? 'FINISHED_SUCCEED' : 'RUNNING';
                        }
                        else {
                            this.msr.state = type === 'succeed' ? 'FINISHED_SUCCEED' : 'FINISHED_FAILED';
                            this.msr.progress = type === 'succeed' ? 100 : -1;
                        }
            
                        calcuTaskDB.update({ _id: this.msr._id }, {
                            $set: {
                                state: this.msr.state,
                                progress: this.msr.progress
                            }
                        });
                    }
                    // TODO 管道的写法，提取出进度条
                    // IBIS 运行是如果数据是使用 ～ 来表示路径时就会出错，而是用/home/shencr不会出错
                    const cp = spawn(`${this.exePath}`, group);
                    cp.stdout.on('data', data => {
                        let str = data.toString();
                        if (str.indexOf(setting.invoke_failed_tag) !== -1) {
                            updateRecord('failed');
                        }
                        else {
                            // 更新 process
                            let group = str.match(setting.progressReg);
                            let progress = group ? group[group.length - 1] : undefined;
                            if (progress) {
                                console.log(progress);
                                updateRecord(undefined, parseFloat(progress));
                            }
                        }
                    });
                    cp.stderr.on('data', data => {
                        // 
                        console.log(data.toString());
                        updateRecord('failed');
                    });
                    cp.on('close', code => {
                        console.log(code);
                        if (code === 0) {
                            console.log('run finished!');
                            updateRecord('succeed');
                        }
                        else {
                            updateRecord('failed');
                        }
                    });
                }
            })
            .catch(e => {
                console.log(e)
                
            })
    }


}